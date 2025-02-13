$(document).ready(function() {
    let usersTable = null;
    let isTableInitialized = false;
    let isLoading = false;
    let initializeTimeout = null;
    let retryCount = 0;
    const maxRetries = 3;

    // Function to initialize DataTable with retry mechanism
    function initializeDataTable() {
        if (isLoading) return;

        // Clear existing timeout
        if (initializeTimeout) {
            clearTimeout(initializeTimeout);
        }

        // Check if table exists
        if (!$('#usersTable').length) {
            retryCount++;
            if (retryCount <= maxRetries) {
                console.log(`Table not found, retrying... (${retryCount}/${maxRetries})`);
                initializeTimeout = setTimeout(initializeDataTable, 1000);
                return;
            }
            console.error('Table element not found after maximum retries');
            return;
        }

        isLoading = true;
        retryCount = 0; // Reset retry count

        // Destroy existing DataTable if any
        if ($.fn.DataTable.isDataTable('#usersTable')) {
            $('#usersTable').DataTable().destroy();
            $('#usersTable').empty();
        }

        try {
            usersTable = $('#usersTable').DataTable({
                ajax: {
                    url: '../../system/manageUsers.php',
                    type: 'GET',
                    data: { action: 'list' },
                    dataSrc: function(response) {
                        isLoading = false;
                        if (!response || !response.data) {
                            console.error('Invalid response:', response);
                            return [];
                        }
                        return response.data;
                    },
                    error: function(xhr, error, thrown) {
                        isLoading = false;
                        console.error('DataTable error:', error);
                        console.error('XHR:', xhr.responseText);
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถโหลดข้อมูลได้'
                        });
                    }
                },
                columns: [
                    { data: 'student_id', defaultContent: '-' },
                    { 
                        data: null,
                        render: function(data) {
                            return data ? `${data.first_name || ''} ${data.last_name || ''}` : '-';
                        }
                    },
                    { data: 'email', defaultContent: '-' },
                    {
                        data: null,
                        render: function(data) {
                            if (!data || data.role !== 'student') return '-';
                            return `ม.${data.grade_level || '-'}/${data.classroom || '-'}`;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            if (!data) return '-';
                            const roles = {
                                'student': 'นักเรียน',
                                'teacher': 'ครู',
                                'admin': 'ผู้ดูแลระบบ'
                            };
                            return roles[data.role] || '-';
                        }
                    },
                    {
                        data: 'created_at',
                        render: function(data) {
                            return data ? new Date(data).toLocaleString('th-TH') : '-';
                        }
                    },
                    {
                        data: 'updated_at',
                        render: function(data) {
                            return data ? new Date(data).toLocaleString('th-TH') : '-';
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
                responsive: true,
                dom: 'lBfrtip',
                order: [[5, 'desc']],
                processing: true,
                serverSide: false,
                language: {
                    processing: "กำลังโหลดข้อมูล...",
                    search: "ค้นหา:",
                    lengthMenu: "แสดง _MENU_ รายการ",
                    info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
                    infoEmpty: "แสดง 0 ถึง 0 จาก 0 รายการ",
                    infoFiltered: "(กรองจากทั้งหมด _MAX_ รายการ)",
                    loadingRecords: "กำลังโหลดข้อมูล...",
                    zeroRecords: "ไม่พบข้อมูล",
                    emptyTable: "ไม่มีข้อมูล"
                },
                drawCallback: function() {
                    isTableInitialized = true;
                    isLoading = false;
                }
            });
        } catch (error) {
            isLoading = false;
            isTableInitialized = false;
            console.error('Error initializing DataTable:', error);
            if (retryCount <= maxRetries) {
                retryCount++;
                console.log(`Retrying initialization... (${retryCount}/${maxRetries})`);
                initializeTimeout = setTimeout(initializeDataTable, 1000);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างตารางข้อมูลได้: ' + error.message
                });
            }
        }
    }

    // เพิ่มหลัง DataTable initialization
    $('#usersTable').on('click', '.edit-user', function() {
        const id = $(this).data('id');
        
        // ดึงข้อมูลผู้ใช้จาก API
        $.get('../../system/manageUsers.php', {
            action: 'get',
            id: id
        }, function(response) {
            if (response.success) {
                const user = response.user;
                
                // กรอกข้อมูลลงใน form
                const form = $('#editUserForm');
                form.find('[name="id"]').val(user.id);
                form.find('[name="role"]').val(user.role);
                form.find('[name="student_id"]').val(user.student_id);
                form.find('[name="first_name"]').val(user.first_name);
                form.find('[name="last_name"]').val(user.last_name);
                form.find('[name="grade_level"]').val(user.grade_level);
                form.find('[name="classroom"]').val(user.classroom);
                form.find('[name="email"]').val(user.email);
                
                // แสดง/ซ่อนฟิลด์ตามประเภทผู้ใช้
                toggleStudentFields(user.role === 'student');
                
                // เปิด modal
                $('#editUserModal').modal('show');
            } else {
                Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้', 'error');
            }
        });
    });

    $('#usersTable').on('click', '.delete-user', function() {
        const id = $(this).data('id');
        
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
                    id: id
                }, function(response) {
                    if (response.success) {
                        Swal.fire('สำเร็จ', 'ลบผู้ใช้เรียบร้อยแล้ว', 'success');
                        usersTable.ajax.reload();
                    } else {
                        Swal.fire('ผิดพลาด', response.message || 'ไม่สามารถลบผู้ใช้ได้', 'error');
                    }
                });
            }
        });
    });

    // เพิ่มฟังก์ชัน helper
    function toggleStudentFields(show) {
        const studentFields = $('#editUserForm [name="student_id"], #editUserForm [name="grade_level"], #editUserForm [name="classroom"]').closest('.mb-3');
        if (show) {
            studentFields.show();
        } else {
            studentFields.hide();
        }
    }

    // เพิ่มฟังก์ชัน validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Event handler สำหรับการ submit form แก้ไข
    $('#updateUser').on('click', function() {
        const form = $('#editUserForm');
        
        // ตรวจสอบอีเมล
        const email = form.find('[name="email"]').val();
        if (!email) {
            form.find('[name="email"]').addClass('is-invalid');
            Swal.fire('ผิดพลาด', 'กรุณากรอกอีเมล', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            form.find('[name="email"]').addClass('is-invalid');
            Swal.fire('ผิดพลาด', 'รูปแบบอีเมลไม่ถูกต้อง', 'error');
            return;
        }

        const formData = {
            action: 'update',
            id: form.find('[name="id"]').val(),
            role: form.find('[name="role"]').val(),
            student_id: form.find('[name="student_id"]').val(),
            first_name: form.find('[name="first_name"]').val(),
            last_name: form.find('[name="last_name"]').val(),
            email: email,
            grade_level: form.find('[name="grade_level"]').val(),
            classroom: form.find('[name="classroom"]').val(),
            password: form.find('[name="password"]').val()
        };

        $.post('../../system/manageUsers.php', formData, function(response) {
            if (response.success) {
                $('#editUserModal').modal('hide');
                Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
                usersTable.ajax.reload();
            } else {
                Swal.fire('ผิดพลาด', response.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        });
    });

    // Event handler สำหรับการเปลี่ยนประเภทผู้ใช้
    $('#editUserForm [name="role"]').on('change', function() {
        toggleStudentFields($(this).val() === 'student');
    });

    // เพิ่มหลัง DataTable initialization
    $('#usersTable').on('click', '.edit-user', function() {
        const id = $(this).data('id');
        // โค้ดสำหรับเปิด modal แก้ไข
    });

    $('#usersTable').on('click', '.delete-user', function() {
        const id = $(this).data('id');
        // โค้ดสำหรับลบผู้ใช้
    });

    // Event handler สำหรับปุ่มบันทึกในฟอร์มเพิ่มผู้ใช้
    $('#saveUser').on('click', function() {
        const form = $('#addUserForm');
        const role = form.find('[name="role"]').val();
        
        // รีเซ็ต validation
        form.find('.is-invalid').removeClass('is-invalid');
        
        // เพิ่ม email ในรายการ required fields
        const requiredFields = ['role', 'first_name', 'last_name', 'password', 'email'];
        let isValid = true;
        
        // เพิ่มการตรวจสอบสำหรับนักเรียน
        if (role === 'student') {
            requiredFields.push('student_id', 'grade_level', 'classroom');
        }
        
        // ตรวจสอบฟิลด์ที่จำเป็นทั้งหมด
        requiredFields.forEach(field => {
            const input = form.find(`[name="${field}"]`);
            if (!input.val()) {
                input.addClass('is-invalid');
                isValid = false;
            }
        });

        if (!isValid) {
            Swal.fire('ผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }

        // ตรวจสอบรูปแบบอีเมล
        const email = form.find('[name="email"]').val();
        if (!isValidEmail(email)) {
            form.find('[name="email"]').addClass('is-invalid');
            Swal.fire('ผิดพลาด', 'รูปแบบอีเมลไม่ถูกต้อง', 'error');
            return;
        }

        // ตรวจสอบรหัสนักเรียนถ้าเป็นนักเรียน
        if (role === 'student') {
            const studentId = form.find('[name="student_id"]').val();
            if (!/^\d{5}$/.test(studentId)) {
                form.find('[name="student_id"]').addClass('is-invalid');
                Swal.fire('ผิดพลาด', 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก', 'error');
                return;
            }
        }

        // ตรวจสอบความยาวรหัสผ่าน
        const password = form.find('[name="password"]').val();
        if (password.length < 6) {
            form.find('[name="password"]').addClass('is-invalid');
            Swal.fire('ผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
            return;
        }

        // รวบรวมข้อมูลฟอร์ม
        const formData = {
            action: 'add',
            role: form.find('[name="role"]').val(),
            student_id: form.find('[name="student_id"]').val(),
            first_name: form.find('[name="first_name"]').val(),
            last_name: form.find('[name="last_name"]').val(),
            email: email,
            grade_level: form.find('[name="grade_level"]').val(),
            classroom: form.find('[name="classroom"]').val(),
            password: password
        };

        // ส่งข้อมูลไปยัง API
        $.post('../../system/manageUsers.php', formData)
            .done(function(response) {
                if (response.success) {
                    $('#addUserModal').modal('hide');
                    form[0].reset();
                    Swal.fire({
                        icon: 'success',
                        title: 'สำเร็จ',
                        text: 'เพิ่มผู้ใช้เรียบร้อยแล้ว',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    usersTable.ajax.reload();
                } else {
                    Swal.fire('ผิดพลาด', response.message || 'ไม่สามารถเพิ่มผู้ใช้ได้', 'error');
                }
            })
            .fail(function(xhr, status, error) {
                console.error('Add user error:', error);
                console.error('Response:', xhr.responseText);
                Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้', 'error');
            });
    });

    // Event handler สำหรับการเปลี่ยนประเภทผู้ใช้ในฟอร์มเพิ่ม
    $('#addUserForm [name="role"]').on('change', function() {
        const isStudent = $(this).val() === 'student';
        toggleAddUserStudentFields(isStudent);
    });

    // แยกฟังก์ชัน toggle fields สำหรับฟอร์มเพิ่ม
    function toggleAddUserStudentFields(show) {
        const studentFields = $('#addUserForm [name="student_id"], #addUserForm [name="grade_level"], #addUserForm [name="classroom"]').closest('.mb-3');
        if (show) {
            studentFields.show();
            $('#addUserForm [name="student_id"]').prop('required', true);
            $('#addUserForm [name="grade_level"]').prop('required', true);
            $('#addUserForm [name="classroom"]').prop('required', true);
        } else {
            studentFields.hide();
            $('#addUserForm [name="student_id"]').prop('required', false);
            $('#addUserForm [name="grade_level"]').prop('required', false);
            $('#addUserForm [name="classroom"]').prop('required', false);
            // รีเซ็ตค่าฟิลด์นักเรียน
            $('#addUserForm [name="student_id"], #addUserForm [name="grade_level"], #addUserForm [name="classroom"]').val('');
        }
    }

    // Event handler สำหรับการเปิด Modal เพิ่มผู้ใช้
    $('#addUserModal').on('show.bs.modal', function() {
        const form = $('#addUserForm');
        form[0].reset();
        form.find('.is-invalid').removeClass('is-invalid');
        
        // เรียก event change เพื่อจัดการฟิลด์ตาม role เริ่มต้น
        const roleSelect = form.find('[name="role"]');
        const isStudent = roleSelect.val() === 'student';
        toggleAddUserStudentFields(isStudent);
    });

    // Initialize table when page loads
    if ($('#usersPage').hasClass('active')) {
        initializeTimeout = setTimeout(initializeDataTable, 500);
    }

    // Bind to page navigation event with debounce
    let navigationTimeout = null;
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'users') {
            retryCount = 0; // Reset retry count
            initializeTimeout = setTimeout(initializeDataTable, 500);
        }
    });

    // Cleanup when leaving page
    $('.sidebar-menu li').on('click', function() {
        if ($(this).data('page') !== 'users') {
            if (usersTable) {
                usersTable.destroy();
                $('#usersTable').empty();
            }
            isTableInitialized = false;
            isLoading = false;
            if (initializeTimeout) {
                clearTimeout(initializeTimeout);
            }
            if (navigationTimeout) {
                clearTimeout(navigationTimeout);
            }
        }
    });
});