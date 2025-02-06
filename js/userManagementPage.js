$(document).ready(function() {
    // Initialize DataTable
    const usersTable = $('#usersTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/th.json'
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
                    if (data.grade_level && data.classroom) {
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
                    return moment(data).format('DD/MM/YYYY HH:mm');
                }
            },
            {
                data: 'updated_at',
                render: function(data) {
                    return moment(data).format('DD/MM/YYYY HH:mm');
                }
            },
            {
                data: null,
                render: function(data) {
                    return `
                        <div class="action-btns">
                            <button class="btn btn-info btn-sm edit-user" data-id="${data.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-user" data-id="${data.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });

    // Filter Handling
    $('#searchInput, #roleFilter, #gradeFilter, #classFilter').on('change keyup', function() {
        usersTable.draw();
    });

    // Add User
    $('#saveUser').click(function() {
        const formData = new FormData($('#addUserForm')[0]);
        
        // Validate form
        if (!$('#addUserForm')[0].checkValidity()) {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        // Add User API Call would go here
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มผู้ใช้สำเร็จ',
            confirmButtonText: 'ตกลง'
        }).then(() => {
            $('#addUserModal').modal('hide');
            usersTable.ajax.reload();
        });
    });

    // Delete User
    $(document).on('click', '.delete-user', function() {
        const userId = $(this).data('id');
        
        Swal.fire({
            title: 'ยืนยันการลบผู้ใช้',
            text: 'คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                // Delete User API Call would go here
                Swal.fire({
                    icon: 'success',
                    title: 'ลบผู้ใช้สำเร็จ',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    usersTable.ajax.reload();
                });
            }
        });
    });

    // Edit User
    $(document).on('click', '.edit-user', function() {
        const userId = $(this).data('id');
        // Fetch user data and show edit modal
        $('#editUserModal').modal('show');
    });
});