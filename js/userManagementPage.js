$(document).ready(function() {
    // Global variables
    let usersTable = null;
    const modalInstances = new Map();
    let isLoading = false;

    // ฟังก์ชันสำหรับจัดการ DataTable
    function setupDataTable() {
        try {
            const tableConfig = {
                processing: true,
                serverSide: false,
                responsive: true,
                ajax: {
                    url: '../../system/manageUsers.php',
                    type: 'GET',
                    data: { action: 'list' },
                    dataSrc: function(response) {
                        // เพิ่ม debug log
                        
                        if (response.success && response.data && response.data.users) {
                            return response.data.users;
                        }
                        // ถ้าไม่มีข้อมูลให้ return array ว่าง
                        return [];
                    }
                },
                columns: [
                    { 
                        data: 'student_id',
                        render: (data, type, row) => row.role === 'student' ? (data || '-') : '-'
                    },
                    { 
                        data: null,
                        render: data => `${data.first_name || ''} ${data.last_name || ''}`
                    },
                    { data: 'email' },
                    {
                        data: null,
                        render: data => data.role === 'student' 
                            ? `ม.${data.grade_level || '-'}/${data.classroom || '-'}` 
                            : '-'
                    },
                    {
                        data: 'role',
                        render: data => ({
                            'student': 'นักเรียน',
                            'teacher': 'ครู',
                            'admin': 'ผู้ดูแลระบบ'
                        })[data] || data
                    },
                    {
                        data: 'created_at',
                        render: data => new Date(data).toLocaleString('th-TH')
                    },
                    {
                        data: 'updated_at',
                        render: data => new Date(data).toLocaleString('th-TH')
                    },
                    { 
                        data: 'gender',
                        render: data => ({
                            'male': 'ชาย',
                            'female': 'หญิง',
                            'other': 'อื่นๆ'
                        })[data] || '-'
                    },
                    { 
                        data: 'club',
                        render: data => data || '-'
                    },
                    {
                        data: null,
                        orderable: false,
                        render: data => `
                            <div class="btn-group">
                                <button class="btn btn-sm btn-warning edit-user" data-id="${data.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger delete-user" data-id="${data.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `
                    }
                ],
                order: [[5, 'desc']],
                language: {
                    "emptyTable": "ไม่พบข้อมูล",
                    "info": "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                    "infoEmpty": "แสดง 0 ถึง 0 จาก 0 รายการ",
                    "infoFiltered": "(กรองข้อมูล _MAX_ ทุกรายการ)",
                    "infoThousands": ",",
                    "lengthMenu": "แสดง _MENU_ รายการ",
                    "loadingRecords": "กำลังโหลดข้อมูล...",
                    "processing": "กำลังดำเนินการ...",
                    "search": "ค้นหา:",
                    "zeroRecords": "ไม่พบข้อมูล",
                    "paginate": {
                        "first": "หน้าแรก",
                        "previous": "ก่อนหน้า",
                        "next": "ถัดไป",
                        "last": "หน้าสุดท้าย"
                    }
                },
                destroy: true,
                retrieve: true
            };

            // เช็คว่ามีตารางอยู่แล้วหรือไม่
            if ($.fn.DataTable.isDataTable('#usersTable')) {
                const existingTable = $('#usersTable').DataTable();
                if (existingTable) {
                    existingTable.clear().destroy();
                }
            }

            // สร้างตารางใหม่
            if ($('#usersTable').length) {
                usersTable = $('#usersTable').DataTable(tableConfig);

                // จัดการ error
                usersTable.on('error.dt', (e, settings, techNote, message) => {
                    console.error('DataTable error:', message);
                    showAlert('error', 'ไม่สามารถโหลดข้อมูลตารางได้');
                });
            } else {
                console.error('Table element not found');
                showAlert('error', 'ไม่พบตารางข้อมูล');
            }

        } catch (error) {
            console.error('Setup DataTable error:', error);
            showAlert('error', 'เกิดข้อผิดพลาดในการตั้งค่าตาราง');
        }
    }

    // ฟังก์ชันจัดการ Modal
    function setupModals() {
        // ล้าง instances เดิม
        modalInstances.forEach(instance => {
            try {
                instance.dispose();
            } catch (error) {
                console.warn('Modal cleanup warning:', error);
            }
        });
        modalInstances.clear();

        // สร้าง instances ใหม่
        ['#addUserModal', '#editUserModal'].forEach(modalId => {
            const element = document.querySelector(modalId);
            if (element) {
                const modal = new bootstrap.Modal(element, {
                    backdrop: 'static',
                    keyboard: false
                });
                modalInstances.set(modalId, modal);

                // จัดการ event เมื่อ modal ถูกซ่อน
                element.addEventListener('hidden.bs.modal', function() {
                    const form = this.querySelector('form');
                    if (form) {
                        form.reset();
                        form.querySelectorAll('.is-invalid').forEach(el => 
                            el.classList.remove('is-invalid')
                        );
                    }
                    // ล้าง backdrop และ class ที่เกี่ยวข้อง
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                });

                // เพิ่ม event listener สำหรับปุ่มยกเลิก
                element.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
                    button.addEventListener('click', function() {
                        const currentModal = bootstrap.Modal.getInstance(element);
                        if (currentModal) {
                            currentModal.hide();
                            // รีเซ็ตฟอร์มทันที
                            const form = element.querySelector('form');
                            if (form) {
                                form.reset();
                                form.querySelectorAll('.is-invalid').forEach(el => 
                                    el.classList.remove('is-invalid')
                                );
                            }
                        }
                    });
                });
            }
        });
    }

    // ฟังก์ชันจัดการ Events
    function setupEventHandlers() {
        // จัดการการเปลี่ยนประเภทผู้ใช้
        $('#addUserForm, #editUserForm').on('change', '[name="role"]', function() {
            const form = $(this).closest('form');
            toggleStudentFields(form, $(this).val() === 'student');
        });

        // จัดการการบันทึกข้อมูล
        $('#saveUser').on('click', () => handleFormSubmit('add', '#addUserForm'));
        $('#updateUser').on('click', () => handleFormSubmit('update', '#editUserForm'));

        // จัดการปุ่มแก้ไขและลบ
        $(document).on('click', '.edit-user', function(e) {
            e.preventDefault();
            loadUserData($(this).data('id'));
        });

        $(document).on('click', '.delete-user', function(e) {
            e.preventDefault();
            confirmDelete($(this).data('id'));
        });
    }

    // Utility Functions
    function showAlert(icon, text) {
        Swal.fire({
            icon,
            text,
            showConfirmButton: icon === 'error',
            timer: icon === 'success' ? 1500 : undefined
        });
    }

    function toggleStudentFields(form, show) {
        const studentFields = form.find('[name="student_id"], [name="grade_level"], [name="classroom"]')
            .closest('.mb-3');
        
        studentFields.toggle(show);
        
        // จัดการ required attributes
        if (show) {
            form.find('[name="student_id"]').prop('required', true);
            form.find('[name="grade_level"]').prop('required', true);
            form.find('[name="classroom"]').prop('required', true);
        } else {
            studentFields.find('input, select').prop('required', false).val('');
        }
    }

    // เพิ่มฟังก์ชัน populateForm ในส่วน Utility Functions
    function populateForm(formSelector, data) {
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (!data || typeof data !== 'object') {
            console.error('Invalid data provided to populateForm:', data);
            return;
        }

        const form = $(formSelector);
        if (!form.length) {
            console.error('Form not found:', formSelector);
            return;
        }
        
        // วนลูปผ่านทุก property ใน data object
        Object.keys(data).forEach(key => {
            const input = form.find(`[name="${key}"]`);
            if (input.length) {
                if (input.is('select')) {
                    input.val(data[key] || '').trigger('change');
                } else if (input.attr('type') === 'radio') {
                    input.filter(`[value="${data[key]}"]`).prop('checked', true).trigger('change');
                } else if (input.attr('type') === 'checkbox') {
                    input.prop('checked', Boolean(data[key])).trigger('change');
                } else {
                    input.val(data[key] || '');
                }
            }
        });

        // จัดการกับ fields พิเศษสำหรับนักเรียน
        if (data.role === 'student') {
            toggleStudentFields(form, true);
        } else {
            toggleStudentFields(form, false);
        }

        // ล้าง validation states
        form.find('.is-invalid').removeClass('is-invalid');
    }

    // CRUD Operations
    function handleFormSubmit(action, formSelector) {
        const form = $(formSelector);
        if (!form[0].checkValidity()) {
            form[0].reportValidity();
            return;
        }

        const formData = new FormData(form[0]);
        formData.append('action', action);

        // เพิ่ม debug log
        console.log('Submitting form data:', Object.fromEntries(formData));

        // Validate form data
        if (formData.get('role') === 'student') {
            const studentId = formData.get('student_id');
            if (!studentId) {
                showAlert('error', 'กรุณากรอกรหัสนักเรียน');
                return;
            }
            if (!/^\d{5}$/.test(studentId)) {
                showAlert('error', 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก');
                return;
            }
            if (!formData.get('grade_level')) {
                showAlert('error', 'กรุณาเลือกระดับชั้น');
                return;
            }
            if (!formData.get('classroom')) {
                showAlert('error', 'กรุณาเลือกห้องเรียน');
                return;
            }
        }

        // ส่งข้อมูล
        $.ajax({
            url: '../../system/manageUsers.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: response => {
                if (response.success) {
                    const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
                    if (modal) {
                        modal.hide();
                        form[0].reset();
                        form.find('.is-invalid').removeClass('is-invalid');
                    }
                    showAlert('success', 
                        action === 'add' ? 'เพิ่มผู้ใช้เรียบร้อย' : 'แก้ไขข้อมูลเรียบร้อย'
                    );
                    if (usersTable) {
                        usersTable.ajax.reload();
                    }
                } else {
                    showAlert('error', response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                }
            },
            error: (xhr, status, error) => {
                console.error('Form submit error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                try {
                    const response = JSON.parse(xhr.responseText);
                    showAlert('error', response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                } catch (e) {
                    showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                }
            }
        });
    }

    // ปรับปรุง loadUserData function
    function loadUserData(id) {
        if (isLoading) return;
        isLoading = true;
        $.get('../../system/manageUsers.php', { action: 'get', id })
            .done(response => {
                // เพิ่ม debug log
                if (response.success && response.data.user) {
                    const modal = modalInstances.get('#editUserModal');
                    if (modal) {
                        try {
                            populateForm('#editUserForm', response.data.user);
                            modal.show();
                        } catch (error) {
                            console.error('Error populating form:', error);
                            showAlert('error', 'เกิดข้อผิดพลาดในการแสดงข้อมูล');
                        }
                    } else {
                        console.error('Modal instance not found');
                        showAlert('error', 'ไม่พบ Modal สำหรับแก้ไขข้อมูล');
                    }
                } else {
                    console.error('Invalid response:', response);
                    showAlert('error', response.message || 'ไม่พบข้อมูลผู้ใช้');
                }
            })
            .fail((xhr, status, error) => {
                console.error('Load user error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                showAlert('error', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
            })
            .always(() => {
                isLoading = false;
            });
    }

    function deleteUser(id) {
        // เพิ่ม debug log
        console.log('Attempting to delete user:', id);
        
        $.ajax({
            url: '../../system/manageUsers.php',
            method: 'POST',
            data: { 
                action: 'delete', 
                id: id 
            },
            dataType: 'json',
            success: response => {
                if (response.success) {
                    showAlert('success', 'ลบผู้ใช้เรียบร้อยแล้ว');
                    if (usersTable) {
                        usersTable.ajax.reload(null, false); // false = ไม่ reset pagination
                    }
                } else {
                    showAlert('error', response.message || 'ไม่สามารถลบผู้ใช้ได้');
                }
            },
            error: (xhr, status, error) => {
                console.error('Delete user error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                showAlert('error', 'ไม่สามารถลบผู้ใช้ได้');
            }
        });
    }

    function confirmDelete(id) {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบผู้ใช้นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser(id);
            }
        });
    }

    // เพิ่ม CSS สำหรับ modal
    const modalStyle = `
        <style>
            .modal {
                overflow-y: auto !important;
            }
            .modal-open {
                overflow: auto !important;
                padding-right: 0 !important;
            }
        </style>
    `;
    $('head').append(modalStyle);

    // Initialize when page loads
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'usersPage') {
            setupModals();
            setupEventHandlers();
            setupDataTable();
        }
    });
});