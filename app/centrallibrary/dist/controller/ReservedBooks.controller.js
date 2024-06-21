sap.ui.define(["./BaseController","sap/ui/core/mvc/Controller"],function(e){"use strict";return e.extend("com.app.centrallibrary.controller.ReservedBooks",{onInit:function(){var e=this.byId("idReservedBooksPageTable");var t=e.getColumns()[5];t.setVisible(false)},RDEL:async function(e){if(this.byId("idReservedBooksPageTable").getSelectedItems().length>1){sap.m.MessageToast.show("Please select only one book for Issuing ");return}var t=this.byId("idReservedBooksPageTable").getSelectedItem().getBindingContext().getObject();console.log(t);var o=e.getSource().getParent();var s=o.getBindingContext().getObject();if(s&&s.books){if(typeof s.books.avl_stock==="number"){s.books.avl_stock=Math.max(0,s.books.avl_stock-1);var a=this.getView().getModel("ModelV2");try{await a.update("/Books("+s.books.ID+")",s.books)}catch(e){console.error("Error updating book avl_stock:",e)}}else{console.error("Quantity is not a number.")}}else{console.error("Selected book or books object is not defined.")}var r=new Date;r.setDate(r.getDate()+20);var i=r.getFullYear();var n=String(r.getMonth()+1).padStart(2,"0");var l=String(r.getDate()).padStart(2,"0");var d=i+"-"+n+"-"+l;const c=new sap.ui.model.json.JSONModel({books_ID:t.books.ID,users_ID:t.users.ID,duedate:d,loandate:new Date,Active:true,notify:`Your reserved book  title "\n                ${t.books.title}\n                " is issued`});this.getView().setModel(c,"userModel");var a=this.getView().getModel("ModelV2");if(!a){a=new sap.ui.model.odata.v2.ODataModel({});this.getView().setModel(a,"ModelV2")}const g=this.getView().getModel("userModel").getProperty("/");try{await this.createData(a,g,"/BooksLoan");sap.m.MessageBox.success(` Reserved Book ID:${g.books_ID} is Issued Successfully to this UserID ${g.users_ID}`);this.getView().byId("idReservedBooksPageTable").getSelectedItem().getBindingContext().delete("$auto")}catch(e){sap.m.MessageBox.error("Some technical Issue")}}})});
//# sourceMappingURL=ReservedBooks.controller.js.map