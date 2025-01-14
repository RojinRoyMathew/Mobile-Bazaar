function addToCart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $("#cart-count").html(count)
        }
        alert("Successfully add to cart")
      }
    })
  }

  
  
  var MenuItems = document.getElementById("MenuItems");
  MenuItems.style.maxHeight = "0px";
  function menutoggle() {
      if (MenuItems.style.maxHeight == "0px") {
          MenuItems.style.maxHeight = "200px"
      }
      else {
          MenuItems.style.maxHeight = "0px"
      }
  }

