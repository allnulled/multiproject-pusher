const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

class Readliner {

  static ask(question) {
    const readliner = new this();
    return readliner.ask(question);
  }

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  ask(question, keepOpened = true) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
        if(!keepOpened) {
          this.rl.close();
        }
      });
    });
  }

  close() {
    this.rl.close();
  }

}

class MultiprojectPusher {

  static from(...args) {
    return new this(...args);
  }

  constructor(projects, listBasepath = process.cwd()) {
    this.projects = projects;
    this.listBasepath = listBasepath;
  }

  async install() {
    Iterating_projects:
    for (const project of this.projects) {
      const { name, path: projectPathInput, source, sourceType = "git" } = project;
      const projectPath = path.resolve(this.listBasepath, projectPathInput);
      console.log(`\n📦 Processing project: ${name} at ${projectPath}`);
      Ensure_directory: {
        if (!fs.existsSync(projectPath)) {
          console.log(`📂 Creating directory: ${projectPath}`);
          fs.mkdirSync(projectPath, { recursive: true });
        }
      }
      Clone_repo: {
        console.log(`🔄 Cloning repository from ${source}`);
        if(sourceType === "git") {
          const innerFiles = await fs.promises.readdir(projectPath);
          if(innerFiles.length) {
            console.log(`✅ Already cloned ${name}`);
            break Clone_repo;
          }
          await this.executeCommand(`git clone ${source} .`, projectPath);
          console.log(`✅ Successfully cloned ${name}`);
        } else {
          throw new Error("Required parameter «sourceType» to be a known type on «MultiprojectPusher.install»");
        }
      }
      Install_dependencies: {
        console.log(`📦 Installing dependencies`);
        await this.executeCommand(`npm install`, projectPath);
      }
      console.log(`✅ Finished processing ${name}`);
    }
    console.log(`\n🎉 All projects have been processed!`);
  }

  async push(precommand = false) {
    for (const project of this.projects) {
      const { name, path: projectPathInput, source, sourceType = "git" } = project;
      const projectPath = path.resolve(this.listBasepath, projectPathInput);
      console.log(`\n📦 Pushing project: ${name} at ${projectPath}`);
      Push_it: {
        console.log(`📦 Git add + commit + push`);
        const statusOutput = await this.executeCommand(`git status --porcelain`, projectPath);
        console.log(statusOutput);
        if (!statusOutput.trim()) {
          console.log(`✅ No changes to commit for ${name}`);
          break Push_it; // Salta el commit si no hay cambios
        }
        const message = await Readliner.ask("Put «commit message»: ");
        await this.executeCommand(`${ precommand ? precommand + " && " : ''}npm run build`, projectPath);
        await this.executeCommand(`${ precommand ? precommand + " && " : ''}npm run test`, projectPath);
        await this.executeCommand(`${ precommand ? precommand + " && " : ''}git add .`, projectPath);
        await this.executeCommand(`${ precommand ? precommand + " && " : ''}git commit -m ${JSON.stringify(message)}`, projectPath);
        await this.executeCommand(`${ precommand ? precommand + " && " : ''}git push`, projectPath);
      }
      console.log(`✅ Finished pushing ${name}`);
    }
    console.log(`\n🎉 All projects have been pushed!`);
  }

  async versionate() {
    for (const project of this.projects) {
      const { name, path: projectPathInput, source, sourceType = "git" } = project;
      const projectPath = path.resolve(this.listBasepath, projectPathInput);
      console.log(`\n📦 Versionate project: ${name} at ${projectPath}`);
      Versionate_it: {
        console.log(`📦 Running npm run versionate`);
        await this.executeCommand(`npm run versionate`, projectPath);
      }
      console.log(`✅ Finished versionating ${name}`);
    }
    console.log(`\n🎉 All projects have been versionated!`);
  }

  async run(command) {
    for (const project of this.projects) {
      const { name, path: projectPathInput, source, sourceType = "git" } = project;
      const projectPath = path.resolve(this.listBasepath, projectPathInput);
      Run_it: {
        const commandFormatted = command.replace("<=%name%>", name).replace("<=%path%>", path).replace("<=%source%>", source).replace("<=%sourceType%>", sourceType)
        console.log(`\n📦 Running command «${commandFormatted}» on project «${name}» at «${projectPath}»`);
        await this.executeCommand(commandFormatted, projectPath);
      }
      console.log(`✅ Finished versionating ${name}`);
    }
    console.log(`\n🎉 All projects have been run!`);
  }

  executeCommand(command, workingDirectory) {
    return new Promise((resolve, reject) => {
      const dir = path.resolve(process.cwd(), workingDirectory);
      console.log(`📦 Executing:\n  - exe: ${command}\n  - dir: ${dir}`);
      exec(command, {
        cwd: dir,
        stdio: [process.stdin, process.stdout, process.stderr],
      }, (error, stdout, stderr) => {
        if (error) {
          // Manejar caso específico para "nada para hacer commit"
          if (command.startsWith("git commit") && stderr.includes("nada para hacer commit")) {
            console.log(`⚠️  No changes to commit.`);
            return resolve(stdout); // Resolver normalmente, sin lanzar error
          }
          console.error(`❌ Error executing "${command}":`, stderr);
          console.error(error);
          return reject(error);
        }
        console.log(stdout);
        resolve(stdout);
      });
    });
  }
}

module.exports = MultiprojectPusher;
