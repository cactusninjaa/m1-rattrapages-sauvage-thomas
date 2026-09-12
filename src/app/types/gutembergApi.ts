interface Author {
    id: number;
    name: string;
}

export interface Book {
    id: number;
    title: string;
    alternative_title: string | null;
    authors: Author[]; // ⚠️ shape exacte à confirmer, voir plus bas
    subjects: string[]; // ⚠️ à confirmer
    bookshelves: string[]; // ⚠️ à confirmer
    formats: Record<string, string>; // probablement { "text/html": "url", "application/epub+zip": "url", ... }
    download_count: number;
    issued: string;
    reading_ease_score: string;
    removed_from_catalog: string | null; // ⚠️ type exact inconnu (date ? booléen déguisé en string ?)
    summary: string;
    cover_image: string;
}

export interface Paginated<T> {
    next: string | null;
    previous: string | null;
    results: T[];
}

interface BookTextMetadata {
    original_length: number;
    cleaned_length: number;
    source_format: string;
    source_url: string;
}

interface BookText {
    book_id: number;
    title: string;
    alternative_title: string | null;
    cleaning_mode: string;
    text: string;
    metadata: BookTextMetadata;
}

interface AuthorDetail {
    id: number;
    name: string;
    birth_year: number | null;
    death_year: number | null;
    webpage: string | null;
    aliases: string[];
    book_count: number;
}

interface Bookshelf {
    id: number;
    name: string;
    description: string;
    book_count: number;
}

// usage
type BooksResponse = Paginated<Book>;
type AuthorsResponse = Paginated<AuthorDetail>;
type BookshelvesResponse = Paginated<Bookshelf>;