$(document).ready(function() {
    // Global variables
    let usersTable = null;
    let isLoading = false;
    let pageInitialized = false;
    let initializeTimeout = null;

    // Initialize DataTable
    function initializeDataTable() {
        // ยกเลิก timeout ที่มีอยู่
        if (initializeTimeout) {
            clearTimeout(initializeTimeout);
        }

        // ถ้ากำลังโหลดอยู่ให้ return
        if (isLoading) return;
        isLoading = true;

        try {
            // ถ้ามี table อยู่แล้วให้ทำลายก่อน
            if ($.fn.DataTable.isDataTable('#usersTable')) {
                usersTable.destroy();
                $('#usersTable tbody').empty();
            }

            usersTable = $('#usersTable').DataTable({
                ajax: {
                    url: '../../system/manageUsers.php',
                    type: 'GET',
                    data: { action: 'list' },
                    dataSrc: function(response) {
                        isLoading = false;
                        pageInitialized = true;
                        return response.data || [];
                    },
                    error: function(xhr, error, thrown) {
                        isLoading = false;
                        console.error('DataTable error:', error);
                        handleError('ไม่สามารถโหลดข้อมูลได้');
                    }
                },
                columns: [
                    { 
                        data: 'student_id',
                        render: function(data, type, row) {
                            return row.role === 'student' ? (data || '-') : '-';
                        }
                    },
                    { 
                        data: null,
                        render: function(data) {
                            return `${data.first_name || ''} ${data.last_name || ''}`;
                        }
                    },
                    { data: 'email' },
                    {
                        data: null,
                        render: function(data) {
                            return data.role === 'student' 
                                ? `ม.${data.grade_level || '-'}/${data.classroom || '-'}`
                                : '-';
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
                            return new Date(data).toLocaleString('th-TH');
                        }
                    },
                    {
                        data: 'updated_at',
                        render: function(data) {
                            return new Date(data).toLocaleString('th-TH');
                        }
                    },
                    {
                        data: null,
                        orderable: false,
                        render: function(data) {
                            return `
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-warning edit-user" data-id="${data.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-user" data-id="${data.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                order: [[5, 'desc']],
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/th.json'
                },
                drawCallback: function() {
                    isLoading = false;
                }
            });

        } catch (error) {
            console.error('Error initializing DataTable:', error);
            handleError('ไม่สามารถสร้างตารางข้อมูลได้');
            isLoading = false;
        }
    }

    // Clean up function
    function cleanupDataTable() {
        if (initializeTimeout) {
            clearTimeout(initializeTimeout);
        }
        if (usersTable && $.fn.DataTable.isDataTable('#usersTable')) {
            usersTable.destroy();
            $('#usersTable tbody').empty();
        }
        pageInitialized = false;
        isLoading = false;
    }

    // ปรับปรุงการจัดการ page navigation
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'users') {
            if (!pageInitialized && !isLoading) {
                initializeTimeout = setTimeout(function() {
                    if ($('#usersTable').length) {
                        initializeDataTable();
                    }
                }, 300);
            }
        } else {
            cleanupDataTable();
        }
    });

    // Initialize on first load
    if ($('#usersPage').hasClass('active')) {
        initializeTimeout = setTimeout(function() {
            if ($('#usersTable').length) {
                initializeDataTable();
            }
        }, 300);
    }

    // Clean up when leaving page
    $('.sidebar-menu li').on('click', function() {
        if ($(this).data('page') !== 'users') {
            cleanupDataTable();
        }
    });

    // Event Handlers
    $('#addUserForm, #editUserForm').on('change', '[name="role"]', function() {
        const form = $(this).closest('form');
        const isStudent = $(this).val() === 'student';
        toggleStudentFields(form, isStudent);
    });

    $('#saveUser').on('click', function() {
        handleFormSubmit('add', '#addUserForm');
    });

    $('#updateUser').on('click', function() {
        handleFormSubmit('update', '#editUserForm');
    });

    $(document).on('click', '.edit-user', function() {
        const id = $(this).data('id');
        loadUserData(id);
    });

    $(document).on('click', '.delete-user', function() {
        const id = $(this).data('id');
        confirmDelete(id);
    });

    // Form Functions
    function toggleStudentFields(form, show) {
        const studentFields = form.find('[name="student_id"], [name="grade_level"], [name="classroom"]')
            .closest('.mb-3');
        
        if (show) {
            studentFields.show();
            form.find('[name="student_id"]').prop('required', true);
        } else {
            studentFields.hide();
            form.find('[name="student_id"]').prop('required', false);
            studentFields.find('input, select').val('');
        }
    }

    function handleFormSubmit(action, formSelector) {
        const form = $(formSelector);
        if (!validateForm(form)) return;

        const formData = new FormData(form[0]);
        formData.append('action', action);

        $.ajax({
            url: '../../system/manageUsers.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $(formSelector.replace('Form', 'Modal')).modal('hide');
                    form[0].reset();
                    showSuccess(action === 'add' ? 'เพิ่มผู้ใช้เรียบร้อย' : 'แก้ไขข้อมูลเรียบร้อย');
                    usersTable.ajax.reload();
                } else {
                    handleError(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Form submit error:', error);
                handleError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        });
    }

    function validateForm(form) {
        form.find('.is-invalid').removeClass('is-invalid');
        const role = form.find('[name="role"]').val();
        let isValid = true;

        // Required fields validation
        const requiredFields = ['first_name', 'last_name', 'email'];
        if (role === 'student') {
            requiredFields.push('student_id', 'grade_level', 'classroom');
        }

        requiredFields.forEach(field => {
            const input = form.find(`[name="${field}"]`);
            if (!input.val()) {
                input.addClass('is-invalid');
                isValid = false;
            }
        });

        if (!isValid) {
            handleError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return false;
        }

        // Email validation
        const email = form.find('[name="email"]').val();
        if (!isValidEmail(email)) {
            form.find('[name="email"]').addClass('is-invalid');
            handleError('รูปแบบอีเมลไม่ถูกต้อง');
            return false;
        }

        // Student ID validation
        if (role === 'student') {
            const studentId = form.find('[name="student_id"]').val();
            if (!/^\d{5}$/.test(studentId)) {
                form.find('[name="student_id"]').addClass('is-invalid');
                handleError('รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก');
                return false;
            }
        }

        return true;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // CRUD Operations
    function loadUserData(id) {
        $.get('../../system/manageUsers.php', { 
            action: 'get', 
            id: id 
        })
        .done(function(response) {
            if (response.success) {
                populateForm('#editUserForm', response.user);
                $('#editUserModal').modal('show');
            } else {
                handleError(response.message);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Load user error:', error);
            handleError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        });
    }

    function populateForm(formSelector, data) {
        const form = $(formSelector);
        Object.keys(data).forEach(key => {
            form.find(`[name="${key}"]`).val(data[key]);
        });
        toggleStudentFields(form, data.role === 'student');
    }

    function confirmDelete(id) {
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
                deleteUser(id);
            }
        });
    }

    function deleteUser(id) {
        $.post('../../system/manageUsers.php', {
            action: 'delete',
            id: id
        })
        .done(function(response) {
            if (response.success) {
                showSuccess('ลบผู้ใช้เรียบร้อยแล้ว');
                usersTable.ajax.reload();
            } else {
                handleError(response.message);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Delete user error:', error);
            handleError('ไม่สามารถลบผู้ใช้ได้');
        });
    }

    // Utility Functions
    function handleError(message) {
        Swal.fire('ผิดพลาด', message, 'error');
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: message,
            showConfirmButton: false,
            timer: 1500
        });
    }
});