module.exports = function(accountType) {
  switch (accountType) {
    case "Income":
    case "Equity":
    case "Accounts Payable":
    case "Liability":
      return "credit";

    case "Expense":
    case "Cash Account":
    case "Bank Account":
    case "Assets":
    case "Fixed Assets":
    case "Accounts Receivable":
      return "debit";

    default:
      throw "Invalid account: " + accountType;
  }
};
