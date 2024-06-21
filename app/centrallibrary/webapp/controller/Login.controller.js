sap.ui.define(
    [ 
        "./BaseController",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/ColumnListItem",
    'sap/m/Input',
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
    ],
    function (BaseController, Token, Filter, FilterOperator, JSONModel, Fragment, MessageBox, ColumnListItem, Input, oDataModel,History,MessageToast) {
      "use strict";

  
      return BaseController.extend("com.app.centrallibrary.controller.Login", {
        onInit: function() {
          const router = ( this.getOwnerComponent()).getRouter();
          router.getRoute("routeLogin").attachPatternMatched(this.onObjectMatched, this);
      
  
                  var oViewModel = new JSONModel({
                      busy: false,
                      delay: 0
                  });
  
   
  
                  debugger;
  
                  //  tokens added(Multi-input)
                  const oView = this.getView(),
                      oMulti1 = this.oView.byId("_IDGenMultiInput1"),
                      oMulti2 = this.oView.byId("_IDGenMultiInput2"),
                      oMulti3 = this.oView.byId("_IDGenMultiInput3");
  
                  let validae = function (arg) {
                      if (true) {
                          var text = arg.text;
                          return new sap.m.Token({ key: text, text: text });
                      }
                  }
                  oMulti1.addValidator(validae);
                  oMulti2.addValidator(validae);
                  oMulti3.addValidator(validae);
  
  
  
                  const oLocalModel = new JSONModel({
                      isbn: "",
                      title: "",
                      quantity: "",
                      avl_stock: "",
                      price: "",
                      pages: "",
                      author: "",
                      status: "In Stock"
  
                  });
  
                  this.getView().setModel(oLocalModel, "localModel");
  
  
              },
              onGoPress: function () {
                  debugger
  
                  //  filter operator
                  const oView = this.getView(),
                      oISBN = oView.byId("_IDGenMultiInput1"),
                      sISBN = oISBN.getTokens(),
                      oAuthor = oView.byId("_IDGenMultiInput2"),
                      sAuthor = oAuthor.getTokens(),
                      oStatus = oView.byId("_IDGenMultiInput3"),
                      sStatus = oStatus.getTokens(),
                      oTable = oView.byId("_IDGenTable1"),
                      aFilters = [];
  
                  // passing the multitokens
  
                  sISBN.filter((ele) => {
                      ele ? aFilters.push(new Filter("isbn", FilterOperator.EQ, ele.getKey())) : " ";
                  })
                  sAuthor.forEach(ele => {
                      if (ele) {
                          aFilters.push(new Filter("author", FilterOperator.EQ, ele.getKey()));
                      }
                  });
  
                  sStatus.filter((ele) => {
                      ele ? aFilters.push(new Filter("status", FilterOperator.EQ, ele.getKey())) : " ";
                  })
  
                  oTable.getBinding("items").filter(aFilters);
  
              },
              setHeaderContext: function () {
                  var oView = this.getView();
                  oView.byId("Bookstitle").setBindingContext(
                      oView.byId("_IDGenTable1").getBinding("items").getHeaderContext().refresh());
                  this.getView().refresh();
              },
              onCreateBtnPress: async function () {
                  debugger
                  if (!this.oCreateBooksDialog) {
  
                      this.oCreateBooksDialog = await this.loadFragment("CreateBooks");
  
                  }
  
                  this.oCreateBooksDialog.open();
              },
              // closing popup
              onCloseDialog: function () {
                  if (this.oCreateBooksDialog.isOpen()) {
                      this.oCreateBooksDialog.close()
                  }
              },
              // clearing filter values
              onClearFilterPress: function () {
                  const oView = this.getView(),
                      oISBN = oView.byId("_IDGenMultiInput1").destroyTokens(),
                      oAuthor = oView.byId("_IDGenMultiInput2").destroyTokens(),
                      oStatus = oView.byId("_IDGenMultiInput3").destroyTokens();
              },
  
              //  adding book details(using createDatamehtod)
              onCreateBook: async function () {
                  const oPayload = this.getView().getModel("localModel").getProperty("/"),
                      oModel = this.getView().getModel("ModelV2");
                  try {
                      await this.createData(oModel, oPayload, "/Books");
                      this.getView().byId("_IDGenTable1").getBinding("items").refresh();
                      this.oCreateBooksDialog.close();
                      sap.m.MessageBox.success(`${oPayload.title} Book is created successfully!!!`);
                  oModel.refresh();
                  } catch (error) {
                      this.oCreateBooksDialog.close();
                      sap.m.MessageBox.error(`Book ISBN:${oPayload.isbn} should be unique`);
                  }
                  
              },
  
              onDeleteBtnPress: async function () {
                  var aSelectedItems = this.byId("_IDGenTable1").getSelectedItems();
                  if(aSelectedItems.length === 0)
                  {
                      sap.m.MessageBox.error("Please select at least One Book Record!!");
                  }
                  else{
  
                  MessageBox.confirm("DO you want to Delete ?",{
                      actions:[MessageBox.Action.OK,MessageBox.Action.CANCEL],emphasizedAction:MessageBox.Action.OK, onClose:async function(sAction){
                          if(sAction== "OK")
  
                         
                      
                  if (aSelectedItems.length > 0) {
                      var aISBNs = [];
                      aSelectedItems.forEach(function (oSelectedItem) {
                          var sISBN = oSelectedItem.getBindingContext().getObject().isbn;
                          aISBNs.push(sISBN);
                          oSelectedItem.getBindingContext().delete("$auto");
                      });
  
                      Promise.all(aISBNs.map(function (sISBN) {
                          return new Promise(function (resolve, reject) {
                              resolve(sISBN + " Successfully Deleted");
                          });
                      })).then(function (aMessages) {
                          aMessages.forEach(function (sMessage) {
                              MessageToast.show(sMessage);
                          });
       
                      }).bind(this).catch(function (oError) {
                          MessageToast.show("Deletion Error: " + oError);
                      });
                      
                      this.getView().byId("_IDGenTable1").getBinding("items").refresh();
                  } else {
                      MessageToast.show("Please Select Rows to Delete");
                  }
                  else{
                      MessageToast.show("Use canceled Delete operation")
                  }
              }.bind(this)
          })
      } 
              },
              
              // for Editing the Book
  
              onEditBtnPress: async function () {
                  
                  var oSelecteds = this.byId("_IDGenTable1").getSelectedItems();
                  if(oSelecteds.length == 0 )
                  {
                      sap.m.MessageBox.error("Please select atleast one book")
                  }
                  else if(oSelecteds.length >1)
                  {
                      sap.m.MessageBox.error("Please Don't select Multiple Books")
                  }
                  else{
                      var oSelected = this.byId("_IDGenTable1").getSelectedItem();
                  if (oSelected) {
                      var oID = oSelected.getBindingContext().getProperty("ID");
                      var oAuthorName = oSelected.getBindingContext().getProperty("author");
                      var oBookname = oSelected.getBindingContext().getProperty("title");
                       this.oStock = oSelected.getBindingContext().getProperty("quantity");
                      var oISBN = oSelected.getBindingContext().getProperty("isbn");
                      var oPrice = oSelected.getBindingContext().getProperty("price");
                      var oPage = oSelected.getBindingContext().getProperty("pages");
                      var oStatus = oSelected.getBindingContext().getProperty("status");
                      this.oavl_quan = oSelected.getBindingContext().getProperty("avl_stock");
                           if(this.oavl_quan == undefined){
                          this.oavl_quan = this.oStock;
                  }
                         
                      var newBookModel = new sap.ui.model.json.JSONModel({
                          ID: oID,
                          author: oAuthorName,
                          title: oBookname,
                          quantity: this.oStock,
                          isbn: oISBN,
                          price: oPrice,
                          pages: oPage,
                          status: oStatus,
                          avl_stock: this.oavl_quan
                      });
                      
                      this.getView().setModel(newBookModel, "newBookModel");
  
                      if (!this.oEditBooksDialog) {
                          this.oEditBooksDialog = await this.loadFragment("EditBook"); // Load your fragment asynchronously
                      }
  
                      this.oEditBooksDialog.open();
                  }
              }
              },
  
              onSave: function () {
                  console.log(this.oStock)
                  console.log(this.oavl_quan)
                  var oPayload = this.getView().getModel("newBookModel").getData();
                  oPayload.quantity;
                  if(oPayload.quantity>this.oStock){
                      var aa=oPayload.quantity-this.oStock;
                      oPayload.avl_stock = this.oavl_quan + aa;
                  }
                  else(oPayload.quantity<this.oStock)
                  {
                      var bb = this.oStock - oPayload.quantity;
                      oPayload.avl_stock = this.oavl_quan-bb;
  
                  }
              
  
                  var oDataModel = this.getOwnerComponent().getModel("ModelV2");// Assuming this is your OData V2 model
                  console.log(oDataModel.getMetadata().getName());
  
                  try {
                      // Assuming your update method is provided by your OData V2 model
                      oDataModel.update("/Books(" + oPayload.ID + ")", oPayload, {
                          success: function () {
                              this.getView().byId("_IDGenTable1").getBinding("items").refresh();
                              this.oEditBooksDialog.close();
                              sap.m.MessageBox.success(`${oPayload.title} Details updated!!`)
                          }.bind(this),
                          error: function (oError) {
                              this.oEditBooksDialog.close();
                              sap.m.MessageBox.error("Failed to update book: " + oError.message);
                          }.bind(this)
                      });
                  } catch (error) {
                      this.oEditBooksDialog.close();
                      sap.m.MessageBox.error("Some technical Issue");
                  }
  
  
                  var oDataModel = new sap.ui.model.odata.v2.ODataModel({
                      serviceUrl: "https://port4004-workspaces-ws-ljsm6.us10.trial.applicationstudio.cloud.sap/v2/BookSRV",
                      defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
                      // Configure message parser
                      messageParser: sap.ui.model.odata.ODataMessageParser
                  })
              },
  
  
              onClose: function () {
                  if (this.oEditBooksDialog.isOpen()) {
                      this.oEditBooksDialog.close();
                  }
              },
  
  
              ActiveLoans: function () {
                  const oRouter = this.getOwnerComponent().getRouter();
                  oRouter.navTo("routeUserLoans")
              },
              Issue: function () {
                  const oRouter = this.getOwnerComponent().getRouter();
                  oRouter.navTo("routeIssuedBooks")
              },
  
              // reserved loan navigation
              Reserved: function () {
                  const oRouter = this.getOwnerComponent().getRouter();
                  oRouter.navTo("routeReservedBooks")
              },
              onISB: async function (oEvent) {
                  var ase = this.byId("_IDGenTable1").getSelectedItems();
                  if(ase.length==0){
  
                      sap.m.MessageBox.error("Please Select at least one entry for Issuing Book")
                  }
                  else if(ase.length>1)
                  {
                      sap.m.MessageBox.error("Please Dont select multiple Entries for Issuing Book")
                  }
                  else{
                  var asel = this.byId("_IDGenTable1").getSelectedItem();
              
                  var oavl_stock = asel.getBindingContext().getProperty("avl_stock")
                   
                  if(oavl_stock==0){
                      sap.m.MessageBox.success("Availability stock is ZERO!!")
                  }
                  else{
                  if (asel) {
  
                      var abooks_ID = asel.getBindingContext().getProperty("ID");
                  }
                   
  
                  // var oSelectedBook = this.byId("_IDGenTable1").getSelectedItem().getBindingContext().getObject();
                  
                  var oSelectedBook = this.byId("_IDGenTable1").getSelectedItem().getBindingContext().getObject();
                  console.log(oSelectedBook);
        
                  var oSelectedItem = oEvent.getSource().getParent();
                  var oSelectedBook1 = oSelectedItem.getBindingContext()
                   
        
                  
                      if (typeof oSelectedBook.avl_stock === 'number') {
                          oSelectedBook.avl_stock = Math.max(0, oSelectedBook.avl_stock - 1);
                          // oSelectedBook.avl_stock=oSelectedBook.setValue(oSelectedBook.avl_stock)
        
                          delete oSelectedBook['@$ui5.context.isSelected'];
                          // Update the avl_stock value in the "Books" entity set
                          var oModel = this.getView().getModel("ModelV2");
                          try {
                              await oModel.update("/Books(" + oSelectedBook.ID + ")", oSelectedBook);
                              this.byId("_IDGenTable1").getBinding("items").refresh();
                              
                              console.log()
                              console.log("success")
                          } catch (error) {
                              console.error("Error updating book avl_stock:", error);
                          }
                      }
                  
          
                  var currentDate = new Date();
  
                  // Format the current date
                  var year = currentDate.getFullYear();
                  var month = String(currentDate.getMonth() + 1).padStart(2, '0');
                  var day = String(currentDate.getDate()).padStart(2, '0');
                  var formattedDate = year + '-' + month + '-' + day;
                  
                  // Add 20 days to the current date
                  currentDate.setDate(currentDate.getDate() + 20);
                  
                  // Get the year, month, and day components after adding 20 days
                  var yearAfter20Days = currentDate.getFullYear();
                  var monthAfter20Days = String(currentDate.getMonth() + 1).padStart(2, '0');
                  var dayAfter20Days = String(currentDate.getDate()).padStart(2, '0');
                  
                  // Format the date after adding 20 days in "yyyy-mm-dd" format
                  var formattedDateAfter20Days = yearAfter20Days + '-' + monthAfter20Days + '-' + dayAfter20Days;
                  // var oInput = sap.ui.core.Fragment.byId("idIssueFragBook", "idIssueBookUserIDVal").getparent();
                  // console.log(oInput);
                  // // Get the value from the input field
                  // var sUserName = oInput.getValue();
                  
                  // // Now you can use sUserName to query the user data model
                  
                  // debugger
                  // oModel.read("/Users", {
                  //     filters: [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.EQ, sUserName)],
                  //     success: function(oData) {
                  //         if (oData.results.length > 0) {
                  //             var sUserID = oData.results[0].ID;
                              
                  //             // Set the UserID value in the model
                  //             this.getView().getModel("newLoanModel").setProperty("/users_ID", sUserID);
                  //         }
                  //     }.bind(this),
                  //     error: function(oError) {
                  //         sap.m.MessageBox.error("Error fetching user data: " + oError);
                  //     }
                  // })
          
              
                  var newLoanModel = new sap.ui.model.json.JSONModel({
                      users_ID: " ",
                      books_ID: abooks_ID,
                      duedate: formattedDateAfter20Days,
                      loandate: formattedDate,
                      Active: true,
                      
  
                  });
                  this.getView().setModel(newLoanModel, "newLoanModel")
  
                  if (!this.oIssueBooksDialog) {
                      this.oIssueBooksDialog = await this.loadFragment("Issue"); // Load your fragment asynchronously
                  }
  
                  this.oIssueBooksDialog.open();
              }
          }
          },
              onIssueClose: function () {
                  if (this.oIssueBooksDialog.isOpen()) {
                      this.oIssueBooksDialog.close();
                  }
  
              },
              onIssueSave: async function () {
                  const oPayload = this.getView().getModel("newLoanModel").getProperty("/");
                  const oModel = this.getView().getModel("ModelV2");
  
                  try {
                      // Attempt to create data
                      await this.createData(oModel, oPayload, "/BooksLoan");
                  
                      // If successful, refresh the binding of the items associated with user loans
                      var userLoansControl = this.getView().byId("idUserLoans");
                  
                          console.log("Dialog:", this.oIssueBooksDialog); // Check if the dialog object is correctly referenced
                          this.oIssueBooksDialog.close(); // Attempt to cl
                          sap.m.MessageBox.success(`Book ID:${oPayload.books_ID} is Issued Successfully to the user ID:${oPayload.users_ID}`) 
                      }  
                  catch (error) {
                      // Handle the error
                      console.error("Error occurred while saving:", error);
                  
                      // Display a user-friendly error message
                      sap.m.MessageBox.error("Failed to save the data. Please try again later.");
                      console.log("Dialog:", this.oIssueBooksDialog); // Check if the dialog object is correctly referenced
  this.oIssueBooksDialog.close(); // Attempt to cl
                  }
              },
              //  admin logout button
              adLog:async function(){
                  const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
  
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
              }else{
                  const oR= this.getOwnerComponent().getRouter();
                  oR.navTo("RouteView1", {}, true);
  
              }
          },
          onAfterRendering: function() {
             
               
          },
          // Function to refresh count
  refreshCount: function () {
      var oTable = this.getView().byId("_IDGenTable1");
      var iCount = oTable.getItems().length;
      // Update count display or perform any other action based on the count
  }
                  
          });
      });
  
  
  