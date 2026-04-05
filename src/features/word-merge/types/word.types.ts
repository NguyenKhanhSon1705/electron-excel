export interface WordPlaceholder {
  name: string;
}

export interface WordTemplate {
  fileName: string;
  content: Uint8Array;
  placeholders: string[];
}

export interface WordMapping {
  placeholder: string;
  excelColumn: string;
}

export interface WordMergeState {
  template: WordTemplate | null;
  mappings: WordMapping[];
  isMerging: boolean;
  progress: number;
}
