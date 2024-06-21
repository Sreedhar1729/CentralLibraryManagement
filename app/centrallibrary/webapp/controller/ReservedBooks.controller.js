sap.ui.define(
    [
      "./BaseController",      
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("com.app.centrallibrary.controller.ReservedBooks", {
        onInit: function() {
          var oTable = this.byId("idReservedBooksPageTable");
  
          var oColumn = oTable.getColumns()[5];
          // var oColumn1 = oTable.getColumns()[5]; // Index 4 represents the fifth column
      
          // Hide the column
          
          oColumn.setVisible(false);
        },
  
        RDEL: async function(oEvent) {
            if (this.byId("idReservedBooksPageTable").getSelectedItems().length > 1) {
                sap.m.MessageToast.show("Please select only one book for Issuing ");
                return;
            }
  
            var oSelectedBook = this.byId("idReservedBooksPageTable").getSelectedItem().getBindingContext().getObject();
            console.log(oSelectedBook);
  
            var oSelectedItem = oEvent.getSource().getParent();
            var oSelectedBook1 = oSelectedItem.getBindingContext().getObject();
  
            if (oSelectedBook1 && oSelectedBook1.books) {
                if (typeof oSelectedBook1.books.avl_stock === 'number') {
                    oSelectedBook1.books.avl_stock = Math.max(0, oSelectedBook1.books.avl_stock - 1);
  
                    // Update the avl_stock value in the "Books" entity set
                    var oModel = this.getView().getModel("ModelV2");
                    try {
                        await oModel.update("/Books(" + oSelectedBook1.books.ID + ")", oSelectedBook1.books);
                    } catch (error) {
                        console.error("Error updating book avl_stock:", error);
                    }
                } else {
                    console.error("Quantity is not a number.");
                }
            } else {
                console.error("Selected book or books object is not defined.");
            }
            var currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 20);
                  
            // Get the year, month, and day components after adding 20 days
            var yearAfter20Days = currentDate.getFullYear();
            var monthAfter20Days = String(currentDate.getMonth() + 1).padStart(2, '0');
            var dayAfter20Days = String(currentDate.getDate()).padStart(2, '0');
            
            // Format the date after adding 20 days in "yyyy-mm-dd" format
            var formattedDateAfter20Days = yearAfter20Days + '-' + monthAfter20Days + '-' + dayAfter20Days;
            const userModel = new sap.ui.model.json.JSONModel({
                books_ID: oSelectedBook.books.ID,
                users_ID: oSelectedBook.users.ID,
                duedate: formattedDateAfter20Days,
                loandate: new Date(),
                Active: true,
                notify: `Your reserved book  title "
                ${oSelectedBook.books.title}
                " is issued`,
                
            });
            this.getView().setModel(userModel, "userModel");
  
            // Ensure oModel is properly defined and initialized
            var oModel = this.getView().getModel("ModelV2");
            if (!oModel) {
                // Initialize oModel here if it's not defined yet
                oModel = new sap.ui.model.odata.v2.ODataModel({
                    // Configuration options
                });
                this.getView().setModel(oModel, "ModelV2");
            }
  
            const oPayload = this.getView().getModel("userModel").getProperty("/");
  
            try {
                await this.createData(oModel, oPayload, "/BooksLoan");
                sap.m.MessageBox.success(` Reserved Book ID:${oPayload.books_ID} is Issued Successfully to this UserID ${oPayload.users_ID}`);
                this.getView().byId("idReservedBooksPageTable").getSelectedItem().getBindingContext().delete("$auto");
                //this.oCreateBooksDialog.close();
            } catch (error) {
                //this.oCreateBooksDialog.close();
                sap.m.MessageBox.error("Some technical Issue");
            }
        }
  
      });
    }
  );
  
  