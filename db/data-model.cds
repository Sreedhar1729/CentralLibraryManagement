namespace app.library;

using {reusable.types as types} from './ReusableTypes';
using {cuid} from '@sap/cds/common';

@assert.unique: {isbn: [isbn]}
define entity Books : cuid {
    isbn             : String;
    title            : String(50);
    quantity         : Integer;
    price            : Decimal(5, 2);
    pages            : Integer;
    // authors: Composition of many Authors on authors.books = $self;
    author           : String;
    status           : String;
    avl_stock        : Integer;
    // users    : Association to Users;
    booksloan_id     : Composition of many BooksLoan
                           on booksloan_id.books = $self;
    reservedbooks_id : Composition of many BooksLoan
                           on reservedbooks_id.books = $self;
    users_id         : Composition of many Users
                           on users_id.books = $self;


}

@assert.unique: {UserName: [UserName]}
define entity Users : cuid {

    email         : types.Email;
    mobile        : types.PhoneNumber;
    UserName      : String;
    Password      : String;
    booksLoan     : Association to many BooksLoan
                        on booksLoan.users = $self;
    reservedbooks : Association to ReservedBooks
                        on reservedbooks.users = $self;
    books         : Association to Books;

}

define entity BooksLoan : cuid {
    users    : Association to Users;
    books    : Association to Books;
    duedate  : Date;
    loandate : Date;
    Active   : Boolean;
    notify   : String;
}

define entity ReservedBooks : cuid {
    users       : Association to Users;
    books       : Association to Books;
    reservedate : Date;


}
