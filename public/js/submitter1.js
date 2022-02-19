// Query DOM
var DoneBtn = document.getElementById('done-btn');
    Displayer = document.getElementById('display');
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

    if(NameInput.value == '' || PriceInput.value == '' || CategoryInput.value == '' || DescInput.value == '' ) {
        console.log('Name NULL');
        showSwal('basic');
    }else{
        //console.log(ImgInput.files[0]
        $.ajax({
            type:"post",
            url:"http://127.0.0.1:4000/api/products",
            dataType: 'json',
            data: JSON.stringify({"name": NameInput.value, "price": PriceInput.value, "category": CategoryInput.value, "info": DescInput.value}),
            contentType: 'application/json'
        })
        .done(function(response){
            console.log("Response of update: ",response)
        })
        .fail(function(xhr, textStatus, errorThrown){
                console.log("ERROR: ",xhr.responseText);
                showSwal('mixin');
                NameInput.value = '';
                PriceInput.value = '';
                CategoryInput.value = 'unnull';
                DescInput.value = '';
                ImgInput.value = '';
                return xhr.responseText;
        });
       
    }
    
    
});