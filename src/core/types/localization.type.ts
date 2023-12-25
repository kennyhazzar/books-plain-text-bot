export type Target =
  | 'language'
  | 'start'
  | 'update_token'
  | 'search'
  | 'book_not_found'
  | 'search_empty_result'
  | 'page_index'
  | 'search_result'
  | 'book_id_parse_error'
  | 'read'
  | 'download'
  | 'link'
  | 'delete'
  | 'delete_error'
  | 'delete_result'
  | 'document_size_limit_error'
  | 'document_books_count_error'
  | 'document_process_message'
  | 'document_not_txt_error'
  | 'document_error'
  | 'error_page_not_found'
  | 'open_in_book'
  | 'close'
  | 'books_title'
  | 'books_open_begin'
  | 'books_continue'
  | 'books_pages'
  | 'books_auth_error'
  | 'page_menu_link'
  | 'page_back_link'
  | 'page_next_link'
  | 'language_error_current_choice';

export type LanguageCode = 'ru' | 'en' | string;

export class Localization {
  target: Target;
  ru: string;
  en: string;
}
