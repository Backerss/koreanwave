$(document).ready(function() {
    // Remove existing event handlers
    $('#searchInput, #roleFilter, #gradeFilter, #classFilter').off();
    $(document).off('click', '.edit-user');
    $(document).off('click', '.delete-user');
    $('#saveUser').off();
    $('#updateUser').off();

    // Clear existing search function
    $.fn.dataTable.ext.search.pop();

    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable('#usersTable')) {
        $('#usersTable').DataTable().destroy();
    }

    // Initialize DataTable
    const usersTable = $('#usersTable').DataTable({
        ajax: {
            url: '../../system/manageUsers.php',
            type: 'GET',
            data: {
                action: 'list'
            }
        },
        columns: [
            { data: 'student_id' },
            { 
                data: null,
                render: function(data) {
                    return `${data.first_name} ${data.last_name}`;
                }
            },
            {
                data: null,
                render: function(data) {
                    if (data.role === 'student') {
                        return `ม.${data.grade_level}/${data.classroom}`;
                    }
                    return '-';
                }
            },
            {
                data: 'role',
                render: function(data) {
                    const roles = {
                        'student': 'นักเรียน',
                        'teacher': 'ครู',
                        'admin': 'ผู้ดูแลระบบ'
                    };
                    return roles[data] || data;
                }
            },
            { 
                data: 'created_at',
                render: function(data) {
                    const date = new Date(data);
                    return date.toLocaleString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            },
            { 
                data: 'updated_at',
                render: function(data) {
                    const date = new Date(data);
                    return date.toLocaleString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            },
            {
                data: null,
                render: function(data) {
                    return `
                        <button class="btn btn-sm btn-primary edit-user" data-id="${data.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${data.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
            }
        ],
        order: [[4, 'desc']],
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
             '<"row"<"col-sm-12"tr>>' +
             '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "ทั้งหมด"]],
        responsive: true,
        language: {
            "decimal": "",
            "emptyTable": "ไม่มีข้อมูลในตาราง",
            "info": "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
            "infoEmpty": "แสดง 0 ถึง 0 จาก 0 รายการ",
            "infoFiltered": "(กรองจากทั้งหมด _MAX_ รายการ)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "แสดง _MENU_ รายการ",
            "loadingRecords": "กำลังโหลด...",
            "processing": "กำลังดำเนินการ...",
            "search": "ค้นหา:",
            "zeroRecords": "ไม่พบข้อมูลที่ตรงกัน",
            "paginate": {
                "first": "หน้าแรก",
                "last": "หน้าสุดท้าย",
                "next": "ถัดไป",
                "previous": "ก่อนหน้า"
            },
            "aria": {
                "sortAscending": ": เรียงจากน้อยไปมาก",
                "sortDescending": ": เรียงจากมากไปน้อย"
            }
        }
    });

    // Filter handlers
    $('#searchInput, #roleFilter, #gradeFilter, #classFilter').on('change keyup', function() {
        usersTable.draw();
    });

    // Custom filtering function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const searchText = $('#searchInput').val().toLowerCase();
        const roleFilter = $('#roleFilter').val();
        const gradeFilter = $('#gradeFilter').val();
        const classFilter = $('#classFilter').val();

        const rowData = usersTable.row(dataIndex).data();
        
        // Search filter
        if (searchText) {
            const searchMatch = data[0].toLowerCase().includes(searchText) || // student_id
                              data[1].toLowerCase().includes(searchText);      // full name
            if (!searchMatch) return false;
        }

        // Role filter
        if (roleFilter && rowData.role !== roleFilter) return false;

        // Grade and class filters (only for students)
        if (rowData.role === 'student') {
            if (gradeFilter && rowData.grade_level !== gradeFilter) return false;
            if (classFilter && rowData.classroom !== classFilter) return false;
        }

        return true;
    });

    // Update the save user handler
    $('#saveUser').click(function() {
        const form = $('#addUserForm');
        if (!form[0].checkValidity()) {
            form[0].reportValidity();
            return;
        }

        // Get form data
        const formData = new FormData(form[0]);
        formData.append('action', 'add');

        // Show loading state
        Swal.fire({
            title: 'กำลังดำเนินการ',
            text: 'กรุณารอสักครู่...',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        // Send request
        $.ajax({
            url: '../../system/manageUsers.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'สำเร็จ',
                        text: 'เพิ่มผู้ใช้เรียบร้อยแล้ว',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    $('#addUserModal').modal('hide');
                    form[0].reset();
                    usersTable.ajax.reload();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ผิดพลาด',
                        text: response.message || 'ไม่สามารถเพิ่มผู้ใช้ได้'
                    });
                }
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'ผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
                });
            }
        });
    });

    // Add role-based field visibility
    $('#addUserForm [name="role"]').change(function() {
        const role = $(this).val();
        const studentFields = $('#addUserForm [name="student_id"], #addUserForm [name="grade_level"], #addUserForm [name="classroom"]').closest('.mb-3');
        
        if (role === 'student') {
            studentFields.slideDown();
            $('#addUserForm [name="student_id"]').prop('required', true);
        } else {
            studentFields.slideUp();
            $('#addUserForm [name="student_id"]').prop('required', false);
        }
    });

    // Edit user handler
    $(document).on('click', '.edit-user', function() {
        const userId = $(this).data('id');
        
        $.get('../../system/manageUsers.php', {
            action: 'get',
            id: userId
        }, function(response) {
            if (response.success) {
                const user = response.user;
                const form = $('#editUserForm');

                // Fill form fields
                form.find('[name="id"]').val(user.id);
                form.find('[name="role"]').val(user.role);
                form.find('[name="student_id"]').val(user.student_id);
                form.find('[name="first_name"]').val(user.first_name);
                form.find('[name="last_name"]').val(user.last_name);
                form.find('[name="grade_level"]').val(user.grade_level);
                form.find('[name="classroom"]').val(user.classroom);

                $('#editUserModal').modal('show');
            }
        });
    });

    // Delete user handler
    $(document).on('click', '.delete-user', function() {
        const userId = $(this).data('id');
        
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                $.post('../../system/manageUsers.php', {
                    action: 'delete',
                    id: userId
                }, function(response) {
                    if (response.success) {
                        Swal.fire('สำเร็จ', 'ลบผู้ใช้เรียบร้อยแล้ว', 'success');
                        usersTable.ajax.reload();
                    } else {
                        Swal.fire('ผิดพลาด', response.message, 'error');
                    }
                });
            }
        });
    });
});