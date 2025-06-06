export interface Notebook {
  id: string;
  title: string;
  createdAt: string;
}

const STORAGE_KEY = 'smartnotebook_notebooks';

export const notebookStorage = {
  load(): Notebook[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load notebooks:', err);
      return [];
    }
  },
  save(notebooks: Notebook[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
    } catch (err) {
      console.error('Failed to save notebooks:', err);
    }
  },
  add(title: string) {
    const notebooks = this.load();
    const notebook: Notebook = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
    };
    notebooks.unshift(notebook);
    this.save(notebooks);
    return notebook;
  },
  delete(id: string) {
    const notebooks = this.load().filter(nb => nb.id !== id);
    this.save(notebooks);
  },
};
