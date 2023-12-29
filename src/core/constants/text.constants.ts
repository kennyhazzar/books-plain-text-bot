import { Localization } from '../types';

export const texts: Localization[] = [
  {
    target: 'start',
    ru: 'Используйте команду /link для получения ссылки на список ваших книг.\nОтправьте мне книгу в txt формате, и я выдам вам ссылку на книгу. Удалить книгу можно с помощью команды /delete, вызовите эту команду для получения информации\n\nВы также можете читать книги в чате бота! Используйте команду /read для получения информации',
    en: 'Use the /link command to get a link to a list of your books.\nSend me a book in txt format and I will give you a link to the book. You can delete a book using the /delete command, call this command to get information\n\nYou can also read books in the bot chat! Use the /read command to get information',
  },
  {
    target: 'language',
    ru: 'Текущий язык помечен точками. Выбирайте язык нажатием кнопки. Текущий язык: %code%',
    en: 'The current language is marked with a dots. Select your language at the touch of a button. Current language: %code%',
  },
  {
    target: 'update_token',
    ru: 'Вы обновили токен для авторизации, новая ссылка: %menuLink%',
    en: 'You have updated your authorization token, new link: %menuLink%',
  },
  {
    target: 'search',
    ru: 'Синтаксис команды: /search <book-id> <text>, где book-id: идентификатор книги (целое число), а text - поисковой текстовый запрос. \nПример /search 7 действительности.\nДанный поиск работает только при полном вхождении.',
    en: 'Command syntax: /search <book-id> <text>, where book-id: book id (integer) and text is the search text query. \nExample /search 7 reality.\nThis search only works with a complete match.',
  },
  {
    target: 'search_result',
    ru: 'Всего найдено вхождений: %searchResultCount%',
    en: 'Total occurrences found: %searchResultCount%',
  },
  {
    target: 'search_empty_result',
    ru: 'По вашему запросу ничего не найдено!',
    en: 'Nothing was found for your request!',
  },
  {
    target: 'page_index',
    ru: 'Страница %index%',
    en: 'Page %index%',
  },
  {
    target: 'close',
    ru: 'Закрыть',
    en: 'Close',
  },
  {
    target: 'book_id_parse_error',
    ru: 'Проверьте айди. Кажется, он не является целым числом',
    en: `Check the ID. It doesn't seem to be an integer`,
  },
  {
    target: 'read',
    ru: 'Синтаксис команды: /read <book-id>, где book-id: идентификатор книги (целое число).\nПример: /read 1\n\nЕсли книга найдена, вы получите текущую страницу и кнопки навигации',
    en: 'Command syntax: /read <book-id>, where book-id: book id (integer).\nExample: /read 1\n\nIf the book is found, you will get the current page and navigation buttons',
  },
  {
    target: 'book_not_found',
    ru: 'Книга не найдена!',
    en: 'Book not found!',
  },
  {
    target: 'download',
    ru: 'Синтаксис команды: /download <book-id>, где book-id: идентификатор книги.\nПример: /download 1',
    en: 'Command syntax: /download <book-id>, where book-id: book identifier.\nExample: /download 1',
  },
  {
    target: 'link',
    ru: 'Ссылка на список книг: %appUrl%/menu?k=%apiKey%',
    en: 'Link to the list of books: %appUrl%/menu?k=%apiKey%',
  },
  {
    target: 'delete',
    ru: 'Синтаксис команды: /delete <book-id>, где book-id: идентификатор книги.\nПример: /delete 1',
    en: 'Command syntax: /delete <book-id>, where book-id: book id.\nExample: /delete 1',
  },
  {
    target: 'delete_error',
    ru: 'Неизвестная ошибка при удалении',
    en: 'Unknown error during deletion',
  },
  {
    target: 'delete_result',
    ru: 'Книга `%title%` автора `%author%` была удалена',
    en: 'The book `%title%` by `%author%` has been deleted',
  },
  {
    target: 'document_size_limit_error',
    ru: 'Файл слишком велик. Ваш лимит: %fileSizeLimit%; Размер файла: %fileSize%\nЧтобы увеличить лимит, напишите разработчику: @kennyhazzar',
    en: 'The file is too large. Your limit: %fileSizeLimit%; File size: %fileSize%\nTo increase the limit, write to the developer: @kennyhazzar',
  },
  {
    target: 'document_books_count_error',
    ru: 'Вы достигли максимума книг на ваш аккаунт! Ваш лимит: %userLimit%;\nЧтобы увеличить лимит, напишите разработчику: @kennyhazzar',
    en: 'You have reached the maximum number of books on your account! Your limit: %userLimit%;\nTo increase the limit, write to the developer: @kennyhazzar',
  },
  {
    target: 'document_process_message',
    ru: 'Начинаю обработку...\n(Название книги: %fileName%; Автор: %author%)',
    en: 'Starting processing...\n(Book title: %fileName%; Author: %author%)',
  },
  {
    target: 'document_error',
    ru: 'Неизвестная ошибка при создании книги. Узнайте у разработчика: @kennyhazzar',
    en: 'Unknown error while creating book. Find out from the developer: @kennyhazzar',
  },
  {
    target: 'document_not_txt_error',
    ru: 'На данный момент бот поддерживает только работу с .txt файлами. Пожалуйста, отправьте книгу в формате .txt',
    en: 'At the moment the bot only supports working with .txt files. Please send the book in .txt format',
  },
  {
    target: 'error_page_not_found',
    ru: 'Ошибка! Этой страницы или книги не существует!',
    en: 'Error! This page or book does not exist!',
  },
  {
    target: 'books_title',
    ru: 'Список книг',
    en: 'List of books',
  },
  {
    target: 'books_open_begin',
    ru: 'Открыть сначала',
    en: 'Start from the beginning',
  },
  {
    target: 'books_continue',
    ru: 'Продолжить чтение',
    en: 'Continue reading',
  },
  {
    target: 'books_pages',
    ru: 'Страницы',
    en: 'Pages',
  },
  {
    target: 'books_auth_error',
    ru: 'Ошибка авторизации',
    en: 'Authorization error',
  },
  {
    target: 'page_menu_link',
    ru: 'меню',
    en: 'menu',
  },
  {
    target: 'page_back_link',
    ru: 'назад',
    en: 'back',
  },
  {
    target: 'page_next_link',
    ru: 'след',
    en: 'next',
  },
  {
    target: 'language_error_current_choice',
    ru: 'Вы уже выбрали этот язык',
    en: 'You have already selected this language',
  },
  {
    target: 'menu_page',
    ru: 'Текущая страница: %currentPage%\nВсего страниц: %totalPage%\nВсего книг: %bookCount%',
    en: 'Current page: %currentPage%\nAll pages: %totalPage%\nAll books: %bookCount%',
  },
  {
    target: 'menu_book',
    ru: '%title% %author%; %currentPage% / %totalPage% ; %percent% (id: %id%)\n',
    en: '%title% %author%; %currentPage% / %totalPage% ; %percent% (id: %id%)\n',
  },
  {
    target: 'empty_partile',
    ru: 'Пусто',
    en: 'Empty',
  },
  {
    target: 'no_changes_detected',
    ru: 'Изменений не обнаружено',
    en: 'No changes detected',
  },
  {
    target: 'menu_books_not_found',
    ru: 'Вы еще не добавили книги в систему. Отправьте .txt файл',
    en: `You haven't added books to the system yet. Send .txt file`,
  },
  {
    target: 'book_menu_read_chat',
    ru: 'Читать в чате',
    en: 'Read in chat',
  },
  {
    target: 'book_menu_read_web',
    ru: 'Читать в браузере',
    en: 'Read in browser',
  },
  {
    target: 'book_menu_delete',
    ru: 'Удалить',
    en: 'Delete book',
  },
  {
    target: 'book_menu_download',
    ru: 'Скачать',
    en: 'Download',
  },
  {
    target: 'menu_particle',
    ru: 'Меню',
    en: 'Menu',
  },
  {
    target: 'set_chunk',
    ru: 'Вы можете изменить размер страницы (чанка).\nВнимание: Уже созданные книги не будут изменены. Данный функционал в разработке.\nТекущий выбор отмечен точками',
    en: 'You can change the page (chunk) size.\nNote: Already created books will not be changed. This functionality is under development.\nThe current selection is marked with dots',
  },
];
