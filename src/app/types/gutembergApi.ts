interface Author {
    id: number;
    name: string;
}

export interface Book {
    id: number;
    title: string;
    alternative_title: string | null;
    authors: Author[];
    subjects: string[];
    bookshelves: string[];
    media_type: string;
    download_count: number;
    issued: string; // ISO date
    reading_ease_score: string; // ⚠️ string dans l'exemple ("81.20"), pas number
    cover_image: string;
}

interface Paginated<T> {
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