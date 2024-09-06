import { Notice, Plugin, TFile } from 'obsidian';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789bcdef', 24);

export default class RenameImagesPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'rename-images',
      name: 'Rename all PNG and JPG files with unique names',
      callback: async () => {
        await this.renameAllFiles();
        new Notice('All PNG and JPG files renamed.');
      }
    });
  }

  async renameAllFiles() {
    const vault = this.app.vault;
    const files = vault.getFiles();

    for (const file of files) {
      if (file.extension === 'png' || file.extension === 'jpg') {
        if (!this.isRenamed(file)) {
          await this.renameFile(file);
        }
      }
    }
  }

  async renameFile(file: TFile) {
    const newFileName = nanoid() + '.' + file.extension
    if (file.parent == null) {
      return
    }
    const newPath = `${file.parent.path}/${newFileName}`;

    await this.app.fileManager.renameFile(file, newPath);
  }

  isRenamed(file: TFile) {
    const fileNameWithoutExtension = file.name.replace(/\.[^.]+$/, "");
    return /[0-9a-f]{24}/.test(fileNameWithoutExtension);
  }
}
