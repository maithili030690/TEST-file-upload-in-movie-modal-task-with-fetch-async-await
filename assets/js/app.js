const cl =console.log;
const movieContainer=document.getElementById('movieContainer');
const addMovieBtn=document.getElementById('addMovieBtn');
const backdrop=document.getElementById('backdrop');
const movieModal=document.getElementById('movieModal');
const titleControl=document.getElementById('title');
const contentControl=document.getElementById('content');
const ratingControl=document.getElementById('rating');
const bannerFile=document.getElementById('bannerFile');
const bannerImg=document.getElementById('bannerImg');
const submitBtn=document.getElementById('submitBtn');
const updateBtn=document.getElementById('updateBtn');
const movieForm=document.getElementById('movieForm');
const movieClose =[...document.querySelectorAll('.movieClose')]
const loader=document.getElementById('loader')

const BASE_URL=`https://post-crud-56394-default-rtdb.asia-southeast1.firebasedatabase.app/`

const POST_URL=`${BASE_URL}/posts.json`

const sweetAlert =(mgs,icon)=>{
        sweetAlert.fire({
                title:mgs,
                timmer:2500,
                icon:icon
        })
}
const toggleModalBackdrop=()=>{
        backdrop.classList.toggle('visible')
        movieModal.classList.toggle('visible')
        submitBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
}

movieClose.forEach(btn=>{
        btn.addEventListener('click',toggleModalBackdrop)
})

const templating =(arr)=>{
        let result='';
        arr.forEach(movie=>{
                result += `
                <div class="col-md-4">
               <div class="card movieCard mb-4" id="${movie.id}">
                  <figure class="m-0">
                     <img src="${movie.bannerImgDetail? movie.bannerImgDetail.baseUrl : ''}" alt="" title="">
                     <figcaption>
                     <div class="figcapInfo">
                        <h2 class="m-0">${movie.title}</h2>
                        <span>Rating ${movie.rating}/5</span>
                        <p>${movie.content}</p>
                     </div>
                        <div class="d-flex justify-content-between">
                           <button class="btn btn-primary btn-sm" onclick="onEdit(this)">Edit</button>
                           <button class="btn btn-danger btn-sm nfx-btn" onclick="onRemove(this)">Remove</button>
                        </div>
                     </figcaption>
                  </figure>
               </div>
            </div>
                `

        })
        movieContainer.innerHTML =result;

}

const makeApiCall =async(methodName,apiUrl,msgBody)=>{
       try{
        msgBody=msgBody?JSON.stringify(msgBody):null;
        loader.classList.remove('d-none')
        let res =await fetch(apiUrl,{
                method:methodName,
                body:msgBody,
                headers:{
                        "token":"Get JWT Token from ls"
                }
        })
        return res.json()
        
       }catch{
        sweetAlert(err,'error')
       }finally{
        loader.classList.add('d-none')
       }
}
const fetchPost=async()=>{
        let data =await makeApiCall("GET",POST_URL)
        cl(data);
        let movieArr=[];
        for (const key in data) {
               movieArr.unshift({...data[key],id:key})
               cl(movieArr)
        }
        templating(movieArr)
}
fetchPost()


const onBannerFileChange=(event)=>{
        cl('file change',event.target.files);
        return new Promise((resolve,reject)=>{
                let selectedFile=event.target.files[0]
                cl(selectedFile)
                if(selectedFile){
                        let reader = new FileReader();
                        reader.onload=function(e){
                                cl(e.target.result)
                                let bannerImageInfo ={
                                        title:selectedFile.name,
                                        type:selectedFile.type,
                                        timeStamp:Date.now(),
                                        baseUrl:e.target.result,
                                        size:selectedFile.size
                                }
                                resolve(bannerImageInfo)
                        }
                        reader.readAsDataURL(selectedFile)
                }else{
                        reject('no file selected')
                }
               
        })
}
const onRemove=async(ele)=>{
        try{
           let getConfirm = await Swal.fire({
                   title: "Are you sure?",
                   text: "You won't be able to revert this!",
                   icon: "warning",
                   showCancelButton: true,
                   confirmButtonColor: "#3085d6",
                   cancelButtonColor: "#d33",
                   confirmButtonText: "Yes, delete it!"
                 })
                   if (getConfirm.isConfirmed) {
                           let removeId = ele.closest('.card').id;
                           cl(removeId)
                           let DELETE_URL= `${BASE_URL}/posts/${removeId}.json`
                   
                           //api call
                          let res= await makeApiCall("DELETE",DELETE_URL)
                          cl(res)
                          ele.closest('.card').parentElement.remove()
                          sweetAlert(`${removeId}is remove successfully`,'success')
                   }
        }catch{
           sweetAlert(err,'error')
        }         
   }

const onAddMovie =async(eve)=>{
        eve.preventDefault()
        let getBanner =bannerFile.files.length? await onBannerFileChange({target:bannerFile}):null;
        let newObj ={
                title:titleControl.value,
                content:contentControl.value,
                rating:ratingControl.value,
                bannerImgDetail:getBanner
        }
        cl(newObj);
        toggleModalBackdrop()
        movieForm.reset()
        let res =await makeApiCall("POST",POST_URL,newObj)
        cl(res)
        newObj.id =res.name;
        let div = document.createElement('div')
        div.className =`col-md-4`
        div.innerHTML=`
         <div class="card movieCard mb-4" id="${newObj.id}">
                  <figure class="m-0">
                     <img src="${newObj.bannerImgDetail ? newObj.bannerImgDetail.baseUrl:''}" alt="" title="">
                     <figcaption >
                     <div class="figcapInfo">
                     <h2 class="m-0">${newObj.title}</h2>
                        <span>Rating ${newObj.rating}/5</span>
                        <p>${newObj.content}</p>
                     </div>
                        
                        <div class="d-flex justify-content-between">
                           <button class="btn btn-primary btn-sm" onclick="onEdit(this)">Edit</button>
                           <button class="btn btn-danger btn-sm nfx-btn" onclick="onRemove(this)">Remove</button>
                        </div>
                     </figcaption>
                  </figure>
               </div>
        `
        movieContainer.prepend(div);
        sweetAlert(`${newObj.title} is added successfully`,'success')
        
        
}
const onEdit =async(ele)=>{
        toggleModalBackdrop()
        let editId =ele.closest('.card').id;
        cl(editId);
        window.scrollTo({
                top:0,
                behavior:'smooth'
        })
        localStorage.setItem("editId",editId)
        let EDIT_URL =`${BASE_URL}/posts/${editId}.json`
        //api call
        let res = await makeApiCall("GET",EDIT_URL)
        cl(res);
                titleControl.value =res.title;
                contentControl.value =res.content;
                ratingControl.value =res.rating;
                updateBtn.classList.remove('d-none')
                submitBtn.classList.add('d-none')

}
const onUpdateMovie = async()=>{   
        let updateId =localStorage.getItem('editId')
        cl(updateId)
        let getBanner =bannerFile.files.length? await onBannerFileChange({target:bannerFile}):null;
        let updatedObj ={
         title:titleControl.value,
         content:contentControl.value,
         rating:ratingControl.value,
         bannerImgDetail:getBanner||null
        }
        cl(updatedObj)
        movieForm.reset()
        toggleModalBackdrop()
        let UPDATED_URL =`${BASE_URL}/posts/${updateId}.json`
        //api call
        let res =await makeApiCall("PATCH",UPDATED_URL,updatedObj)
        cl(res)
        let card =document.getElementById(updateId)
        card.innerHTML=`
                 <figure class="m-0">
                      <img src="${updatedObj.bannerImgDetail ? updatedObj.bannerImgDetail.baseUrl:''}" alt="" title="">
                      <figcaption >
                      <div class="figcapInfo">
                       <h2 class="m-0">${updatedObj.title}</h2>
                         <span>Rating ${updatedObj.rating}/5</span>
                         <p>${updatedObj.content}</p>
                      </div>
                        
                         <div class="d-flex justify-content-between">
                            <button class="btn btn-primary btn-sm" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger btn-sm nfx-btn" onclick="onRemove(this)">Remove</button>
                         </div>
                      </figcaption>
                   </figure>
        `
 
 
        updateBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
        sweetAlert(`${updatedObj.title}is updated successfully`,'success')
 
 }

       
movieForm.addEventListener('submit',onAddMovie)
addMovieBtn.addEventListener('click',toggleModalBackdrop)
bannerFile.addEventListener('change',onBannerFileChange)
updateBtn.addEventListener('click',onUpdateMovie)




