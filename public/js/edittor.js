// Query DOM
var DoneBtn = document.getElementById('done-btn');
    Displayer = document.getElementById('display');
    IdInput = document.getElementsByName('insertId')[0];
    NameInput = document.getElementsByName('insertName')[0];
    PriceInput = document.getElementsByName('insertPrice')[0];
    CategoryInput = document.getElementsByName('insertCategory')[0];
    DescInput = document.getElementsByName('insertDesc')[0];
    ImgInput = document.getElementsByName('insertImg')[0];
    
	
	
//Event Listener
ImgInput.addEventListener('change', function() {
    Displayer.src = window.URL.createObjectURL(ImgInput.files[0])
})


DoneBtn.addEventListener('click', function() {

    if(IdInput.value == '' || NameInput.value == '' || PriceInput.value == '' || CategoryInput.value == '' || DescInput.value == '' ) {
        console.log('Name NULL');
        showSwal('basic');
    }else{
        var fd = new FormData();
        var files = ImgInput.files[0];
        fd.append('productImage',files);
		fd.append('name', NameInput.value);
        fd.append('price', PriceInput.value);
        fd.append('category', CategoryInput.value);
        fd.append('info', DescInput.value);

        $.ajax({
            type:"put",
            url:"http://127.0.0.1:4000/api/products/"+ IdInput.value,
            dataType: 'json',
            data: JSON.stringify({"name": NameInput.value, "price": PriceInput.value, "category": CategoryInput.value, "info": DescInput.value}),
            contentType: 'application/json'
            //data: fd,
			//contentType: false,
			//processData: false,
        })
        .done(function(response){
            console.log("Response of update: ",response);
			
        })
        .fail(function(xhr, textStatus, errorThrown){
                console.log("ERROR: ",xhr.responseText);
                showSwal('mixin');
				NameInput.value = '';
				PriceInput.value = '';
				CategoryInput.value = 'unnull';
				DescInput.value = '';
				ImgInput.value = '';
				location.href = "http://127.0.0.1:4000/dashboard/products/"
                return xhr.responseText;
        });
       
    }
    
    
});