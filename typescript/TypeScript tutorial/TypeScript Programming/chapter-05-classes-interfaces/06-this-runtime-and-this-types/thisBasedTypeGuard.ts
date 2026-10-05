// Goal:
// Use this-based type guards to narrow a class hierarchy.

// Expected result:
// The compiler narrows the instance in each branch.

export {};

class FileSystemNode {
  constructor(public readonly path: string) {}

  isFile(): this is FileNode {
    return this instanceof FileNode;
  }

  isDirectory(): this is DirectoryNode {
    return this instanceof DirectoryNode;
  }
}

class FileNode extends FileSystemNode {
  constructor(path: string, public readonly content: string) {
    super(path);
  }
}

class DirectoryNode extends FileSystemNode {
  children: FileSystemNode[] = [];
}

const node: FileSystemNode = new FileNode("/readme.md", "hello");

if (node.isFile()) {
  console.log(node.content);
} else if (node.isDirectory()) {
  console.log(node.children.length);
}
