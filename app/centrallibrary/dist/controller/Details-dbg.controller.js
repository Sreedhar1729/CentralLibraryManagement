sap.ui.define(
    [
        "./BaseController",
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/odata/v2/ODataModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ], 
    function (BaseController, ODataModel,Filter,FilterOperator) {
        "use strict";
  
      return BaseController.extend("com.app.centrallibrary.controller.Details", {
        onInit: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
        },

        onUserDetailsLoad: function (oEvent) {
            const { ID } = oEvent.getParameter("arguments");
            this.id = ID;
            const sRouterName = oEvent.getParameter("name");
            const oObjectPage = this.getView().byId("ObjectPageLayout");

            oObjectPage.bindElement(`/Users(${ID})`);
        },

        onBorrowNewBookPress: async function (oEvent) {

            // var oSel = this.byId("idBooksTable").getSelectedItem().getBindingContext().getObject();
            var oSelectedItem = oEvent.getSource().getParent();
            console.log(oSelectedItem);
            var oSelectedUser = oSelectedItem.getBindingContext().getObject();
            if(this.byId("idBooksTable").getSelectedItems().length == 0){
                sap.m.MessageBox.error("Please select at least one book for Reservation");
                return;

            }
            
            if (this.byId("idBooksTable").getSelectedItems().length > 1) {
                sap.m.MessageBox.error("Please select only one book for Reservation");
                return;
            }
            var oSelectedBook = this.byId("idBooksTable").getSelectedItem().getBindingContext().getObject();
            if(oSelectedBook.avl_stock == 0){
                sap.m.MessageBox.error("AVL quantity is ZERO!!!");
            }
            
            else{
                debugger
                const bisBookReserved = await this.checkIfBookIsReservedByUser(oSelectedBook.ID,oSelectedUser.ID);
                if(bisBookReserved){
                    sap.m.MessageBox.error("This Book is already Reserved by YOU!!!")
                    return;
                }

                 // Check if the book is currently borrowed by the user
       const bIsBookBorrowed = await this.checkIfBookIsBorrowedByUser(oSelectedBook.ID, oSelectedUser.ID);
 
       if (bIsBookBorrowed) {
        sap.m.MessageBox.error("Book is  already borrowed by YOU!!!!.");
         return;
       }
       

                
            const userModel = new sap.ui.model.json.JSONModel({
                users_ID: oSelectedUser.ID,
                books_ID: oSelectedBook.ID,
                reservedate: new Date(),
               
            });
             
            this.getView().setModel(userModel, "userModel");

            const oPayload = this.getView().getModel("userModel").getProperty("/"),
                oModel = this.getView().getModel("ModelV2");

            try {
                await this.createData(oModel, oPayload, "/ReservedBooks");
                sap.m.MessageBox.success(`Book ID: ${oPayload.books_ID} is  reserved Successfully!!`);
 

            } catch (error) {
                sap.m.MessageBox.error("Some technical issue occurred");
            }
        }
        },

        createData: function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.create(sPath, oPayload, {
                    refreshAfterChange: true,
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData);
                    }
                });
            });
        },
        onNotificationPress: async function () {
            if (!this.oNotificationDialog) {
                this.oNotificationDialog = await this.loadFragment("Notification"); // Load your fragment asynchronously
            }
            this.oNotificationDialog.open();
            const oObjectPage = this.getView().byId("idDialogNotify");

            oObjectPage.bindElement(`/Users(${this.id})`);
        },
        onCloseNotification: function () {
            if (this.oNotificationDialog.isOpen()) {
                this.oNotificationDialog.close();
            }
        },
        onHome: async function () {
            const oRoute = this.getOwnerComponent().getRouter();
            oRoute.navTo("RouteView1", {}, true);
        },
        // Book Reserved Check condition
        checkIfBookIsReservedByUser: function(bookId, userID) {
            return new Promise((resolve, reject) => {
                const oModel = this.getView().getModel("ModelV2");
                const oFilter = [
                    new sap.ui.model.Filter("books_ID", sap.ui.model.FilterOperator.EQ, bookId),
                    new sap.ui.model.Filter("users_ID", sap.ui.model.FilterOperator.EQ, userID)
                ];
        
                oModel.read("/ReservedBooks", {
                    filters: oFilter,
                    success: function(oData) {
                        console.log("Data received:", oData); // Log received data
                        if (oData && oData.results) {
                            const isReserved = oData.results.length > 0;
                            console.log("Is reserved:", isReserved); // Log result
                            resolve(isReserved); // Resolve with boolean value
                        } else {
                            reject("No data received from service");
                        }
                    },
                    error: function(oError) {
                        console.error("Error:", oError); // Log error
                        reject(oError); // Reject promise with error
                    }
                });
            });
        },
        checkIfBookIsBorrowedByUser: function(bookID, userID) {
            debugger
            return new Promise((resolve, reject) => {
              const oModel = this.getView().getModel("ModelV2");
              const oFilters = [
                new sap.ui.model.Filter("books_ID", sap.ui.model.FilterOperator.EQ, bookID),
                new sap.ui.model.Filter("users_ID", sap.ui.model.FilterOperator.EQ, userID)
            ];
    
       
              oModel.read("/BooksLoan", {
                filters: oFilters,
               
       
                success: function(oData) {
                  console.log("Bookloans data:", oData);
                  // Check if any of the loans are still active (no returndate)
                  const bIsBorrowed = oData.results.some(loan => loan.Active===true);
                  console.log("Active loans found:", bIsBorrowed);
                  resolve(bIsBorrowed);
                },
                error: function(oError) {
                  console.error("Error reading Bookloans:", oError);
                  reject(oError);
                }
              });
            });
          },
        
    });
});
  