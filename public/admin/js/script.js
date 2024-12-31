// Button Status
const listButtonStatus = document.querySelectorAll("[button-status]");
if (listButtonStatus.length > 0) {
    let url = new URL(window.location.href);

    // Bắt sự kiện click
    listButtonStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if (status) {
                url.searchParams.set("status", status);
            } else {
                url.searchParams.delete("status");
            }
            window.location.href = url.href;
        });
    });

    // Thêm class active mặc định
    const statusCurrent = url.searchParams.get("status") || "";
    const buttonCurrent = document.querySelector(`[button-status="${statusCurrent}"]`);
    if (buttonCurrent) {
        buttonCurrent.classList.add("active");
    }
}
// End Button Status

// Form Search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener("submit", (event) => {
        event.preventDefault();
        const keyword = event.target.elements.keyword.value;

        if (keyword) {
            url.searchParams.set("keyword", keyword);
        } else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search

// Pagination
const listButtonPagination = document.querySelectorAll("[button-pagination]");
if (listButtonPagination.length > 0) {
    let url = new URL(window.location.href);

    listButtonPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");
            url.searchParams.set("page", page);
            window.location.href = url.href;
        });
    });
}
// End Pagination

// Button Change Status
const listButtonChangeStatus = document.querySelectorAll("[button-change-status]");
if (listButtonChangeStatus.length > 0) {
    listButtonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const link = button.getAttribute("link");
            fetch(link, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        window.location.reload();
                    }
                })
        });
    });
}
// End Button Change Status

// Check Item
const inputCheckAll = document.querySelector("input[name='checkAll']");
if (inputCheckAll) {
    const listInputCheckItem = document.querySelectorAll("input[name='checkItem']");

    // Bắt sự kiên click vào nút checkAll
    inputCheckAll.addEventListener("click", () => {
        listInputCheckItem.forEach(inputCheckItem => {
            inputCheckItem.checked = inputCheckAll.checked;
        });
    });

    // Bắt sự kiên click vào nút checkItem
    listInputCheckItem.forEach(inputCheckItem => {
        inputCheckItem.addEventListener("click", () => {
            const listInputCheckItemChecked = document.querySelectorAll("input[name='checkItem']:checked");

            if (listInputCheckItem.length == listInputCheckItemChecked.length) {
                inputCheckAll.checked = true;
            } else {
                inputCheckAll.checked = false;
            }
        });
    });
}
// End Check Item

// Box Actions
const boxActions = document.querySelector("[box-actions]");
if(boxActions) {
  const button = boxActions.querySelector("button");

  button.addEventListener("click", () => {
    const select = boxActions.querySelector("select");
    const status = select.value;

    const listInputChecked = document.querySelectorAll("input[name='checkItem']:checked");
    const ids = [];
    listInputChecked.forEach(input => {
      ids.push(input.value);
    });

    if(status != "" && ids.length > 0) {
      const dataChangeMulti = {
        status: status,
        ids: ids
      };

      const link = boxActions.getAttribute("box-actions");

      fetch(link, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataChangeMulti),
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == 200) {
            window.location.reload();
          }
        })
    } else {
      alert("Hành động và checkItem phải được chọn!");
    }
  });
}
// End Box Actions

// Xóa bản ghi
const listButtonDelete = document.querySelectorAll("[button-delete]");
if(listButtonDelete.length > 0){
    listButtonDelete.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const link = button.getAttribute("button-delete");
            const confirmed = confirm("Bạn có chắc chắn muốn xóa không?");

            if(confirmed){
                fetch(link, {
                    method: "PATCH"
                })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 200){
                        window.location.reload();                }
                })
            }
        });
    });
}
// Hết Xóa bản ghi

// Thay đổi vị trí
const listInputPosition = document.querySelectorAll("input[name='position']");
if(listInputPosition.length > 0){
    listInputPosition.forEach(input => {
        input.addEventListener("change", () => {
            const link = input.getAttribute("link");
            const position = parseInt(input.value);

            fetch(link, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    position: position
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            });
        });
    });
}
// Hết Thay đổi vị trí

// show-alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert){
    let time = showAlert.getAttribute("show-alert") || 3000;
    time = parseInt(time);

    setTimeout(() => {
        showAlert.classList.add("hidden");
    }, time);
}
// End show-alert

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
    const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
    const imagePreviewContainer = uploadImage.querySelector(".image-preview-container");

    uploadImageInput.addEventListener("change", () => {
        const files = uploadImageInput.files;
        if (files) {
            imagePreviewContainer.innerHTML = ''; // Xóa toàn bộ ảnh cũ khi chọn ảnh mới

            for (const file of files) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('image-preview');
                    img.style.marginRight = '10px';
                    imagePreviewContainer.appendChild(img);
                };

                reader.readAsDataURL(file);
            }
        }
    });
}

// End Upload Image

// Sort
const sort = document.querySelector("[sort]");
if(sort){
    let url = new URL(window.location.href);

    const select = sort.querySelector("[sort-select]");
    select.addEventListener("change", () => {
        const [sortKey, sortValue] = select.value.split("-");
        
        if(sortKey && sortValue){
            url.searchParams.set("sortKey", sortKey);
            url.searchParams.set("sortValue", sortValue);

            window.location.href = url.href;
        }
    });

    // Thêm selected mặc định cho option
    const defaultSortKey = url.searchParams.get("sortKey");
    const defaultSortValue = url.searchParams.get("sortValue");

    if(defaultSortKey && defaultSortValue){
        const optionSelected = select.querySelector(`option[value="${defaultSortKey}-${defaultSortValue}"]`);
        optionSelected.selected = true;
        // optionSelected.setAttribute("selected", true);
    }

     // Tính năng clear
     const buttonClear = sort.querySelector("[sort-clear]");
     if(buttonClear){
        buttonClear.addEventListener("click", () => {
            url.searchParams.delete("sortKey");
            url.searchParams.delete("sortValue");

            window.location.href = url.href;
        });
     }
}
// End Sort

// Phân quyền
const tablePermissions = document.querySelector("[table-permissions]");
if(tablePermissions){
    const buttonSubmit = document.querySelector("[button-submit");
    buttonSubmit.addEventListener("click", () => {
        const roles = [];
        const listElementRoleId = tablePermissions.querySelectorAll("[role-id]");
        for(const element of listElementRoleId){
            const roleId = element.getAttribute("role-id");
            const role = {
                id: roleId,
                permissions: []
            };

            const listInputChecked = tablePermissions.querySelectorAll(`input[data-id="${roleId}"]:checked`);
            listInputChecked.forEach(input => {
                const dataName = input.getAttribute("data-name");
                role.permissions.push(dataName);
            });

            roles.push(role);
        }
        const path = buttonSubmit.getAttribute("button-submit");
    
        fetch(path, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(roles)
        })
            .then(res => res.json())
            .then(data => {
                if(data.code == 200){
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: data.message,
                        showConfirmButton: false,
                        timer: 1500
                      });
                }
            }
        );
    });
}
// Hết Phân quyền

// Khôi phục bên trang thùng rác
const listButtonRestore = document.querySelectorAll("[button-restore");
if(listButtonRestore.length > 0){
    listButtonRestore.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const link = button.getAttribute("button-restore");
            const confirmed = confirm("Bạn có chắc chắn muốn khôi phục không?");
            if(confirmed){
                fetch(link, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 200){
                        window.location.reload();
                    }
                })
            }
        })
    });
}
// Hết khôi phục

// Xóa hoàn toàn bản ghi bên trang thùng rác
const listButtonPermanent = document.querySelectorAll("[button-permanent");
if(listButtonPermanent.length > 0){
    listButtonPermanent.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            const link = button.getAttribute("button-permanent");
            const confirmed = confirm("Bạn có chắc chắn muốn xóa vĩnh viễn không?");

            if(confirmed){
                fetch(link, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 200){
                        window.location.reload();
                    }
                })
            }
        });
    });
}
// Hết xóa hoàn toàn

// Select Order Status
const orderStatusElements = document.querySelectorAll("[orderStatus]");

if(orderStatusElements.length > 0){
    orderStatusElements.forEach(orderStatus => {
        orderStatus.addEventListener("change", (event) => {
          event.preventDefault();
      
          const orderId = orderStatus.getAttribute('data-order-id');
          const newStatus = orderStatus.value;
      
          const link = orderStatus.getAttribute("orderStatus");
      
          fetch(link, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: orderId,
              status: newStatus
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.code == 200) {
              window.location.reload();
            } else {
              alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
          });
        });
      });
}
// End Select Order Status

// Toggle Password
const passInput = document.querySelector("#passwordInput");
if(passInput){
    const buttonTogglePass = document.querySelector("#togglePassword");
    const eyeIcon = buttonTogglePass.querySelector("[icon]");

    if (buttonTogglePass) {
        buttonTogglePass.addEventListener("click", () => {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                passInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    }
}
// End Toggle Password