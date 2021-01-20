//BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }else{
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(current){
      sum += current.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      Exp: [],
      Inc: [],
    },
    totals: {
      Exp: 0,
      Inc: 0,
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      //create new item based on 'inc' or 'exp'
      if (type === "Exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "Inc") {
        newItem = new Income(ID, des, val);
      }
      //push it in to our data structure
      data.allItems[type].push(newItem);
      //return the new element
      return newItem;
    },
    deleteItem: function(type, id){
      var ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1){
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function(){
      // calculate total income and expense
      calculateTotal("Exp");
      calculateTotal("Inc");
      // calculate the budget income - expense
      data.budget = data.totals.Inc - data.totals.Exp;
      //calculate the percentage income that we used
      data.percentage = Math.round((data.totals.Exp / data.totals.Inc) * 100);
    },
    calculatePercentages: function(){
      data.allItems.Exp.forEach(function(current){
        current.calcPercentage(data.totals.Inc);
      });
    },
    getPercentages: function(){
      var allPerc = data.allItems.Exp.map(function(current){
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.Inc,
        totalExp: data.totals.Exp,
        percentage: data.percentage
      }
    },
    testing: function () {
      console.log(data);
    },
  };
})();

//UICONTROLLER
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add-type",
    inputDescription: ".add-description",
    inputValue: ".add-value",
    inputBtn: ".add-button",
    incomeContainer:".income-list",
    expensesContainer:".expense-list",
    budgetLabel:".budget-value",
    incomeLabel:".cumulative-inc",
    expenseLabel:".cumulative-exp",
    percentageLabel:".percentage-expense",
    all:".all",
    expensePercLabel:".item-percentage",
    dateLabel:".budget-title"
  };
  var formatNumber = function(num, type){
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    
    return  (type === "Exp"? "-" : "+") + " " +  int + "." + dec;
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    addListItem: function (obj, type) {
        //html string with place holder text
        var html, newHtml, element;
        if(type === "Inc"){
          element = DOMStrings.incomeContainer;
            html = '<div class="col " id="Inc-%id%"><span class="item-description">%description%</span><span class="item-value">%value%</span><span class="item-delete"><button class="item-delete-btn">i</button></span></div>';
        }else if(type === "Exp"){
          element = DOMStrings.expensesContainer;
            html = '<div class= "col"><div class ="col " id="Exp-%id%"><span class="item-description">%description%</span><span class="item-value">%value%</span><span class="item-percentage">23%</span><span class="item-delete"><button class="item-delete-btn">i</button></span></div></div>'
        }
      //replace place holder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      //insert the html in to the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItems: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMStrings.inputDescription + ", "+DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      });
      fieldsArr[0].focus;
    },
    displayBudget: function(obj){
      var type, Exp, Inc;
      obj.budget > 0? type = "Inc": type = "Exp";
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,Inc);
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,Exp);
      
      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + " %";
      }else{
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(DOMStrings.expensePercLabel);
      var nodeListForEach = function(list, callback){
         for(var i = 0; i < list.length; i++){
          callback(list[i], i);
         }
      };
      nodeListForEach(fields, function(current, index){
        if (percentages[index] > 0){
          current.textContent = percentages[index] + "%";
        }else{
          current.textContent = "--";
        }
        });
    },
    displayMonth: function(){
      var now, months, month, year;
      now = new Date();
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
    },
    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  //getinput data
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.all).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  };
  var updateBudget = function(){
    //calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budget = budgetCtrl.getBudget();
    // display the budget in UI
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function(){
    //calculate percentages
    budgetCtrl.calculatePercentages();
    //read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //update the UI with new percentages
    UICtrl.displayPercentages(percentages);
  };
  //Add an item to the budget controller
  var ctrlAddItem = function () {
    var input, newItem;
    //get the field input data
    input = UICtrl.getInput();
    if(input.description !== "" && !isNaN(input.value) && input.value>0){
    //add the item to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //add the item to the IU
    UICtrl.addListItem(newItem, input.type);
    //clear the fields
    UICtrl.clearFields();
    //Calculate and update budget
    updateBudget();
    //calculate and update percentages
    updatePercentages();
    };
  };
  var ctrlDeleteItem = function(event){
    var itemID,splitID,ID;
    itemID = event.target.parentNode.parentNode.id;
    if (itemID){
      //inc - 1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //delete the item from UI
      UICtrl.deleteListItems(itemID);
      //update and show the new budget
      updateBudget();
      //calculate and update percentages
      updatePercentages();
    }
  };
  return {
    init: function () {
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
      UICtrl.displayMonth( );
      console.log("application has started");
    }
  };
})(budgetController, UIController);
controller.init();