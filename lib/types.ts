export type PromptType = 'analogy' | 'keyword' | 'summary' | 'paragraph' | 'note';

export type stringifiedContent = {
    content: string;
    depth: number;
}

// --- EDUCATION STRUCTURE ---

export type Book = {
    id: string;
    subject: string;
    grade: number;
    imgUrl: string;
}

export type Unit = {
    id: string;
    title: string;
    BookId: string;
}

export type Lesson = {
    id: string;
    title: string;
    unitId: string;
    ParentLessonId?: string;
    index: number;
}

// --- TAGGING SYSTEM ---

export type Tag = {
    id: string;
    name: string;
    linkedWith: string[];
}

export type UniversalTag = {
    id: string;
    TagId: string;
    index: number;
}

// --- USER SYSTEM ---

export type User = {
    id: string;
    gender: 'MALE' | 'FEMALE';
    age: number;
    first: string;
    last: string;
    email: string;
    password: string;
    imgUrl: string;
    createdAt: string;
    userspecificAPI:string[];
    UISettings: Record<string, any>;
}

export type UserTag = {
    id: string;
    UserId: string;
    TagId: string;
    likingLevel: number;
}

// --- ANALOGY SYSTEM ---

export type Analogy = {
    id: string;
    content: string;
    logic: string;
    lessonId?: string;
    ParagraphId?: string;
    likes: number;
    dislikes: number;
    defaultAnalogyId: string;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type DefaultAnalogy = {
    id: string;
    content: string;
    logic: string;
    lessonId?: string;
    ParagraphId?: string;
    likes: number;
    dislikes: number;
    UserId: string;
    order: number;
    AnalogyId: string;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type UserAnalogy = {
    id: string;
    UserId: string;
    AnalogyId: string;
    status: 'liked' | 'disliked' | 'neutral';
    flaged: boolean;
    onuse: boolean;
    lastSeenAt: string;
    skiped: boolean;
}

export type TagRelatorAnalogy = {
    id: string;
    TagId: string;
    AnalogyId: string;
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
}

// --- PARAGRAPH SYSTEM ---

export type RealParagraph = {
    id: string;
    content: string;
    LessonId: string;
    MasterParagraphId?: string;
    order: number;
    AnalogyId?: string[];
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type Paragraph = {
    id: string;
    content: string;
    LessonId: string;
    likes: number; // Added
    dislikes: number; // Added
    MasterParagraphId?: string;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type DefaultParagraph = {
    id: string;
    content: string;
    LessonId: string;
    order: number;
    RealParagraphId: string;
    // Added for consistency
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
    ParagraphId:string;
    UserId: string;
}

export type UserParagraph = {
    id: string;
    UserId: string;
    ParagraphId: string;
    status: 'liked' | 'disliked' | 'neutral';
    flaged: boolean;
    onuse: boolean;
    lastSeenAt: string;
    skiped: boolean;
}

export type TagRelatorParagraph = {
    id: string;
    TagId: string;
    ParagraphId: string;
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
}

// --- SUMMARY SYSTEM ---

export type Summery = {
    id: string;
    content: string;
    LessonId?: string;
    UnitId?: string;
    likes: number;
    dislikes: number;
    DefaultSummeryId?: string;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type DefaultSummery = {
    id: string;
    content: string;
    LessonId: string;
    UnitId: string;
    likes: number;
    dislikes: number;
    UserId: string;
    order: number;
    SummeryId: string;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type UserSummery = {
    id: string;
    UserId: string;
    SummeryId: string;
    status: 'liked' | 'disliked' | 'neutral';
    flaged: boolean;
    onuse: boolean;
    lastSeenAt: string;
    skiped: boolean;
}

export type TagRelatorSummery = {
    id: string;
    TagId: string;
    SummeryId: string;
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
}

// --- KEYWORD SYSTEM ---

export type KeyWord = {
    id: string;
    word: string;
    definition: string;
    keyWordsId: string;
}

export type KeyWords = {
    id: string;
    lessonId?: string;
    ParagraphId?: string;
    likes: number; // Added
    dislikes: number; // Added
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type KeyWordDefault = {
    id: string;
    lessonId?: string;
    ParagraphId?: string;
    UserId: string;
    order: number;
    // Added for consistency
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type UserKeyWords = {
    id: string;
    UserId: string;
    KeyWordsId: string;
    status: 'liked' | 'disliked' | 'neutral';
    flaged: boolean;
    onuse: boolean;
    lastSeenAt: string;
    skiped: boolean;
}

export type TagRelatorKeyWords = {
    id: string;
    TagId: string;
    KeyWordsId: string;
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
}

// --- NOTE SYSTEM ---

export type Note = {
    id: string;
    content: string;
    UserId: string;
    LessonId: string;
    likes: number; // Added
    dislikes: number; // Added
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
}

export type NoteDefault = {
    id: string;
    content: string;
    UserId: string;
    LessonId: string;
    UnitId: string;
    // Added for consistency
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
    createdAt: string;
    NoteId:string
}

export type UserNote = {
    id: string;
    UserId: string;
    NoteId: string;
    status: 'liked' | 'disliked' | 'neutral';
    flaged: boolean;
    onuse: boolean;
    lastSeenAt: string;
    skiped: boolean;
}

export type TagRelatorNote = {
    id: string;
    TagId: string;
    NoteId: string;
    likes: number;
    dislikes: number;
    views: number;
    usage: number;
    flags: number;
}
export type Box = {
    id:string;
    title:string;
    content:string;
    class:string; // classing for css
}