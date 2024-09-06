import { Notice, Plugin, TFile } from 'obsidian';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789bcdef', 24);

const TARGET_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp'];
const isTarget = (file: TFile): boolean => {
  return TARGET_EXTENSIONS.includes(file.extension);
};

export default class RenameImagesPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'rename-attachments',
      name: 'Rename attachments with unique names',
      callback: async () => {
        await this.renameAllFiles();
        new Notice('Attachments were renamed.');
      }
    });

    this.addCommand({
      id: 'delete-unused-attachments',
      name: 'Delete all unused attachments',
      callback: async () => {
        await this.deleteUnusedFiles();
        new Notice('Unused attachments were deleted.');
      }
    })
  }

  async deleteUnusedFiles() {
    const files = this.app.vault.getFiles();
    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    for (const file of files) {
      if (isTarget(file)) {
        let isUsed = false;

        for (const sourcePath in resolvedLinks) {
          if (resolvedLinks[sourcePath][file.path]) {
            isUsed = true;
            break;
          }
        }

        if (!isUsed) {
          await this.app.vault.delete(file);
        }
      }
    }
  }

  isRenamed(file: TFile) {
    const fileNameWithoutExtension = file.name.replace(/\.[^.]+$/, "");
    return /[0-9a-f]{24}/.test(fileNameWithoutExtension);
  }

  async renameAllFiles() {
    const vault = this.app.vault;
    const files = vault.getFiles();

    for (const file of files) {
      if (isTarget(file)) {
        if (!this.isRenamed(file)) {
          const newFileName = nanoid() + '.' + file.extension
          if (file.parent == null) {
            return
          }
          const newPath = `${file.parent.path}/${newFileName}`;

          await this.app.fileManager.renameFile(file, newPath);
        }
      }
    }
  }
}
