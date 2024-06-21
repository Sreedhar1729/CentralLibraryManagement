using app.library as my from '../db/data-model.cds';

@path: '/BookSRV'

service AppLibraryService {
     @restrict: [{
        grant: '*',
        to   : 'Admin'
    }]
    entity Books           as projection on my.Books;
    entity Users           as projection on my.Users;
    entity BooksLoan       as projection on my.BooksLoan;
    entity ReservedBooks as projection on my.ReservedBooks;
    
}