sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("com.app.centrallibrary.controller.UserLoans", {
        onInit: function() {
          var oTable = this.byId("idUserLoans");

      var oColumn = oTable.getColumns()[6]; // Index 4 represents the fifth column
  
      // Hide the column
      oColumn.setVisible(false);
      },
      onClickDelete:async function(oEvent){
        var osel1 = this.byId("idUserLoans").getSelectedItems();
        if(osel1.length>1)
        {
          sap.m.MessageBox.error("Dont select Multiple Entries for Closing Loan")
        }else if(osel1.length == 0){
          sap.m.MessageBox.error(`Please Select atleast One ROW for Closing Loan`);
        }
        else{
        var osel = this.byId("idUserLoans").getSelectedItem().getBindingContext().getObject();
        
        // var osel = this.byId("idReservedBooksPageTable").getSelectedItem().getBindingContext().getObject();
        console.log(osel);
        
            if (typeof osel.books.avl_stock === 'number') {
                osel.books.avl_stock = Math.max(0, osel.books.avl_stock + 1);

                // Update the avl_stock value in the "Books" entity set
                var oModel = this.getView().getModel("ModelV2");
                try {
                    await oModel.update("/Books(" + osel.books.ID + ")", osel.books);
                } catch (error) {
                    console.error("Error updating book avl_stock:", error);
                }
            } else {
                console.error("Quantity is not a number.");
            }
        



         
      
        const newUserLoans = new sap.ui.model.json.JSONModel({
          ID:osel.ID,
          books_ID:osel.books.ID,
          users_ID:osel.users.ID,
          Active: false,

        });

        this.getView().setModel(newUserLoans, "newUserLoans");
        const oPayload = this.getView().getModel("newUserLoans").getData()
                oModel = this.getView().getModel("ModelV2");
                try {
                  // Assuming your update method is provided by your OData V2 model
                  oModel.update("/BooksLoan(" + oPayload.ID + ")", oPayload, {
                      success: function() {
                          this.getView().byId("idUserLoans").getBinding("items").refresh();
                          sap.m.MessageBox.success(`${oPayload.users_ID}  Loan closed Successfully!!!`);
                          // this.oEditBooksDialog.close();
                      }.bind(this),
                      error: function(oError) {
                          // this.oEditBooksDialog.close();
                          sap.m.MessageBox.error("Failed to update book: " + oError.message);
                      }.bind(this)
                  });
              } catch (error) {
                  // this.oEditBooksDialog.close();
                  sap.m.MessageBox.error("Some technical Issue");
              }
          
          
              var oModel = new sap.ui.model.odata.v2.ODataModel({
                  serviceUrl: "https://port4004-workspaces-ws-ljsm6.us10.trial.applicationstudio.cloud.sap/v2/BookSRV",
                  defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
                  // Configure message parser
                  messageParser: sap.ui.model.odata.ODataMessageParser
              })  
    
            
          }
  }
    });
  }
);

  