$(document).ready(function() {
    // Global variables
    let usersTable = null;
    let isLoading = false;
    let pageInitialized = false;
    let currentModal = null;  // เพิ่มตัวแปรเก็บ modal ปัจจุบัน
    let isProcessing = false; // เพิ่มตัวแปรควบคุมการทำงาน

    // ฟังก์ชันสำหรับ cleanup events และ modal
    function cleanupModalEvents() {
        // ลบ event handlers ทั้งหมดที่เกี่ยวกับ modal
        $('#addUserModal, #editUserModal').off();
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
        
        // ซ่อน modal ที่อาจค้างอยู่
        $('#addUserModal, #editUserModal').modal('hide');
        currentModal = null;
        isProcessing = false;
    }

    // ปรับปรุง event handlers สำหรับ modal
    function initializeModalHandlers() {
        // Cleanup ก่อน bind events ใหม่
        cleanupModalEvents();

        // จัดการ events เมื่อ modal ถูกปิด
        $('#addUserModal, #editUserModal').on('hidden.bs.modal', function() {
            const $form = $(this).find('form');
            $form[0].reset();
            $form.find('.is-invalid').removeClass('is-invalid');
            currentModal = null;
            isProcessing = false;
        });

        // จัดการ events เมื่อ modal เปิด
        $('#addUserModal, #editUserModal').on('show.bs.modal', function() {
            if (currentModal) {
                currentModal.modal('hide');
            }
            currentModal = $(this);
            isProcessing = true;
        });

        $('.modal').on('shown.bs.modal', function() {
            isProcessing = false;
        });
    }

    // ปรับปรุง event handlers สำหรับปุ่มต่างๆ
    function initializeButtonHandlers() {
        // ลบ event handlers เดิม
        $(document).off('click', '.edit-user, .delete-user');
        $('#saveUser, #updateUser').off('click');

        // Bind events ใหม่
        $(document).on('click', '.edit-user', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (isProcessing) return;
            const id = $(this).data('id');
            loadUserData(id);
        });

        $(document).on('click', '.delete-user', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = $(this).data('id');
            confirmDelete(id);
        });

        $('#saveUser').on('click', function(e) {
            e.preventDefault();
            handleFormSubmit('add', '#addUserForm');
        });

        $('#updateUser').on('click', function(e) {
            e.preventDefault();
            handleFormSubmit('update', '#editUserForm');
        });
    }

    // Add debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize DataTable function
    function initializeDataTable() {
        // ตรวจสอบว่ามีตารางอยู่จริงหรือไม่
        if (!$('#usersTable').length) {
            console.error('Table element not found');
            return;
        }

        // ป้องกันการ initialize ซ้ำ
        if (isLoading) return;
        isLoading = true;

        try {
            // Cleanup existing DataTable
            if ($.fn.DataTable.isDataTable('#usersTable')) {
                let existingTable = $('#usersTable').DataTable();
                existingTable.clear().destroy();
                $('#usersTable tbody').empty();
            }

            // สร้าง DataTable ใหม่
            usersTable = $('#usersTable').DataTable({
                processing: true,
                serverSide: false,
                responsive: true,
                ajax: {
                    url: '../../system/manageUsers.php',
                    type: 'GET',
                    data: { action: 'list' },
                    dataSrc: function(response) {
                        isLoading = false;
                        pageInitialized = true;
                        return response.data || [];
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
            isLoading = false;
            pageInitialized = false;
        }
    }

    // Page Navigation Handler
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'users') {
            // รอให้ DOM พร้อมก่อน initialize
            setTimeout(() => {
                if ($('#usersTable').length) {
                    initializeDataTable();
                }
            }, 300);
        } else {
            // Cleanup when leaving page
            if ($.fn.DataTable.isDataTable('#usersTable')) {
                $('#usersTable').DataTable().destroy();
                $('#usersTable tbody').empty();
            }
            pageInitialized = false;
            isLoading = false;
        }
    });

    // Initialize on page load if we're on users page
    if ($('#usersPage').hasClass('active')) {
        setTimeout(() => {
            if ($('#usersTable').length) {
                initializeDataTable();
            }
        }, 300);
    }

    // Add loading indicator to CSS
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .navigation-disabled {
                pointer-events: none;
                opacity: 0.6;
            }
            .page-loading {
                position: relative;
            }
            .page-loading:after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                z-index: 1000;
            }
        `)
        .appendTo('head');

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
        if (isLoading) return;
        isLoading = true;

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
        })
        .always(function() {
            isLoading = false;
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

    // เพิ่ม event handler สำหรับการเปลี่ยนหน้า
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'usersPage') {
            initializeModalHandlers();
            initializeButtonHandlers();
            if ($('#usersTable').length) {
                setTimeout(() => {
                    initializeDataTable();
                }, 300);
            }
        } else {
            cleanupModalEvents();
        }
    });

    // เพิ่ม CSS สำหรับป้องกัน modal ซ้อนทับ
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .modal {
                z-index: 1050 !important;
            }
            .modal-backdrop {
                z-index: 1040 !important;
            }
            .modal-backdrop + .modal-backdrop {
                display: none !important;
            }
        `)
        .appendTo('head');
});