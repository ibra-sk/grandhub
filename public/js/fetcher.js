// Query DOM
const memberName = document.getElementById('memberName');
      memberPhone = document.getElementById('memberPhone');
      deliveryAddress = document.getElementById('deliveryAddress');
      orderTime = document.getElementById('orderTime');
	  deliveryday = document.getElementById('deliveryday');
      orderStatus = document.getElementById('orderStatus');
      deliveryBtn = document.getElementById('deliveryBtn');
      cartHolder = document.getElementById('cartHolder');
      commentHolder = document.getElementById('commentHolder');
      showmap = document.getElementById('showmap');
    
//Event Listener
deliveryBtn.addEventListener('click', function() {
    //alert('delivery ' + deliveryBtn.value);
    $.ajax({
        type:"post",
        url:"http://127.0.0.1:4000/api/order/status" ,
        dataType: 'json',
        data: JSON.stringify({"orderID": deliveryBtn.value}),
        contentType: 'application/json'
    })
    .done(function(response){
        console.log("Response of delivery: ",response);
        if(response.success == true){
            showSwal('mixin');
            window.location.reload(false); 
        }else{
            alert(response.message);
        }
    })
    .fail(function(xhr, textStatus, errorThrown){
            console.log("ERROR: ",xhr.responseText);
            return xhr.responseText;
    });
})

function myItemTap(x) {
    //alert("Row index is: " + x);
    $.ajax({
        type:"get",
        url:"http://127.0.0.1:4000/api/order/detail/" + x,
        contentType: 'application/json'
    })
    .done(function(response){
        console.log("Response of update: ",response);
        memberName.innerText = response.member;
        memberPhone.innerText = "+256 " + response.phone;
        deliveryAddress.innerText = response.address.length > 36 ? response.address.substring(0, 36) + "..." : response.address;
        
		var currentDate = new Date();	
		const today = currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate();
		const date1 = new Date(today);
		const date2 = new Date(response.delivery_time);
		const diffTime = Math.abs(date2 - date1);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
		orderTime.innerText = (response.time.toLocaleString().toString());
		deliveryday.innerText = response.delivery_time + ' | ' + (diffDays > 0 ? diffDays + " Day/s" : "TODAY");
		
		deliveryBtn.value = response.ord_id;
		showmap.href = "https://maps.google.com/?q=" + response.map_point.split(';').join(',');
        if(response.status == 1) {orderStatus.innerText = "DELIVERED"}else{orderStatus.innerText = "PENDING"};
        var divPane = '';
        for(var i = 0; i < response.items.length; i++) {
            var obj = response.items[i];
            var divPane = divPane + '<div class="d-flex justify-content-between mb-2 pb-2 border-bottom"><div class="d-flex align-items-center hover-pointer"><img class="img-xs rounded-circle" src="https://via.placeholder.com/37x37" alt=""><div class="ml-2"><p>'+ obj.prd_name +'</p><p class="text-muted tx-12">'+ obj.price +' UGX</p><p class="tx-11 text-muted">Quantity: '+ obj.quantity +'</p></div></div></div>'        
            console.log(obj.id);
        }
        cartHolder.innerHTML = divPane;
        commentHolder.innerHTML = '<h6 class="card-title" >Comment</h6><p>'+ response.comment +'</p>';
    })
    .fail(function(xhr, textStatus, errorThrown){
            console.log("ERROR: ",xhr.responseText);
            return xhr.responseText;
    });
}

