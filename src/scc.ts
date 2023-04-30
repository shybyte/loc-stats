export type FileType = string;
export type Extension = string;

export type SccResult = FilesByType[];

export interface FilesByType {
    Name:               FileType;
    Bytes:              number;
    CodeBytes:          number;
    Lines:              number;
    Code:               number;
    Comment:            number;
    Blank:              number;
    Complexity:         number;
    Count:              number;
    WeightedComplexity: number;
    Files:              SccFile[];
}

export interface SccFile {
    Language:           FileType;
    PossibleLanguages:  FileType[];
    Filename:           string;
    Extension:          Extension;
    Location:           string;
    Symlocation:        string;
    Bytes:              number;
    Lines:              number;
    Code:               number;
    Comment:            number;
    Blank:              number;
    Complexity:         number;
    WeightedComplexity: number;
    Hash:               null;
    Callback:           null;
    Binary:             boolean;
    Minified:           boolean;
    Generated:          boolean;
    EndPoint:           number;
}
