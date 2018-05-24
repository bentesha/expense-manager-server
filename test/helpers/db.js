module.exports = function(db){
    return {
        async isAccountingBalanced(){
            let result = await db.from('transaction')
            .where({isCanceled: 0})
            .sum(db.raw('amountCredit - amountDebit'))
            .first()
            .then(result => {
                return result[Object.keys(result)[0]];
            })
            return result === 0;
        }
    }
}