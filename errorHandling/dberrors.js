module.exports = {
    handleDuplicate: (error) => {
      const value = error.keyValue.name
  
      const message = `Duplicate field value: ${value}.Please use another value!`
  
      return message
    },
    couponduplicate:(error)=>{
      const value1=error.keyValue.couponCode

      let  message=`Duplicate Coupon : ${value1}.Please use another value!`
      
      return message

    
    }
  };
 