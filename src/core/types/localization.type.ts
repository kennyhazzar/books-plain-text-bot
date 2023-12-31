export type Target =
  | 'language'
  | 'start'
  | 'update_token'
  | 'search'
  | 'book_not_found'
  | 'search_empty_result'
  | 'page_index'
  | 'search_result'
  | 'search_open_in_book'
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
  | 'language_error_current_choice'
  | 'menu_page'
  | 'menu_book'
  | 'empty_partile'
  | 'no_changes_detected'
  | 'menu_books_not_found'
  | 'book_menu_read_chat'
  | 'book_menu_read_web'
  | 'book_menu_delete'
  | 'book_menu_download'
  | 'book_menu_label'
  | 'menu_particle'
  | 'set_chunk';

export type LanguageCode = 'ru' | 'en' | string;

export class Localization {
  target: Target;
  ru: string;
  en: string;
}
