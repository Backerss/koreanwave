$(document).ready(function() {
    let progressTable;
    
    // Initialize DataTable
    function initializeTable() {
        try {
            // เช็คว่ามีตารางอยู่จริงๆ ก่อนที่จะ destroy
            if ($.fn.DataTable.isDataTable('#studentsProgressTable') && $('#studentsProgressTable').length) {
                $('#studentsProgressTable').DataTable().destroy();
            }

            // เช็คว่ามี element อยู่จริง
            if (!$('#studentsProgressTable').length) {
                console.warn('Table element not found');
                return;
            }

            progressTable = $('#studentsProgressTable').DataTable({
                processing: true,
                serverSide: false,
                ajax: {
                    url: '../../system/progressTracker.php',
                    type: 'GET',
                    data: function(d) {
                        return {
                            action: 'getStudentsProgress',
                            grade: $('#gradeFilter').val(),
                            class: $('#classFilter').val()
                        };
                    },
                    error: function(xhr, error, thrown) {
                        console.error('DataTables Ajax Error:', error);
                    }
                },
                columns: [
                    { data: 'student_id' },
                    { data: 'full_name' },
                    { 
                        data: null,
                        render: function(data) {
                            return `ม.${data.grade_level}/${data.classroom}`;
                        }
                    },
                    { 
                        data: 'progress',
                        render: function(data) {
                            return `
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" 
                                         style="width: ${data}%" 
                                         aria-valuenow="${data}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                        ${data}%
                                    </div>
                                </div>
                            `;
                        }
                    },
                    { 
                        data: 'pretest_avg',
                        render: function(data) {
                            // แสดงคะแนนดิบแบบไม่มีทศนิยม
                            return data ? Math.round(data) : '-';
                        }
                    },
                    { 
                        data: 'posttest_avg',
                        render: function(data) {
                            // แสดงคะแนนดิบแบบไม่มีทศนิยม
                            return data ? Math.round(data) : '-';
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            const improvement = data.posttest_avg - data.pretest_avg;
                            const color = improvement > 0 ? 'success' : improvement < 0 ? 'danger' : 'secondary';
                            const icon = improvement > 0 ? 'up' : improvement < 0 ? 'down' : 'minus';
                            
                            // แปลงเป็นทศนิยม 2 ตำแหน่ง
                            let formattedImprovement = Math.abs(improvement).toFixed(2);
                            // ถ้าลงท้ายด้วย .00 ให้ตัดออก
                            if (formattedImprovement.endsWith('.00')) {
                                formattedImprovement = Math.abs(Math.round(improvement)).toString();
                            }

                            return `
                                <span class="text-${color}">
                                    <i class="fas fa-arrow-${icon}"></i> 
                                    ${formattedImprovement}
                                </span>
                            `;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            return `
                                <button class="btn btn-sm btn-primary view-details" 
                                        data-id="${data.id}" 
                                        title="ดูรายละเอียด">
                                    <i class="fas fa-eye"></i>
                                </button>
                            `;
                        }
                    }
                ],
                order: [[2, 'asc']],
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
                        "last": "หน้าสุดท้าย", 
                        "next": "ถัดไป",
                        "previous": "ก่อนหน้า"
                    }
                },
                initComplete: function() {
                    console.log('Table initialized successfully');
                },
                drawCallback: function() {
                    console.log('Table drawn successfully');
                }
            });

            // Add error handling
            progressTable.on('error.dt', function(e, settings, techNote, message) {
                console.error('DataTable error:', message);
            });

        } catch (error) {
            console.error('Table initialization error:', error);
        }
    }

    // Update loadSummaryStats function
    function loadSummaryStats() {
        $.ajax({
            url: '../../system/progressTracker.php',
            type: 'GET',
            data: {
                action: 'getSummaryStats',
                grade: $('#gradeFilter').val(),
                class: $('#classFilter').val()
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    // Update total students
                    $('#totalStudents').text(data.total);
                    $('#maleCount').text(data.male_count);
                    $('#femaleCount').text(data.female_count);
                    
                    // Update completed students
                    $('#completedStudents').text(data.completed);
                    const completedPercent = ((data.completed / data.total) * 100).toFixed(1);
                    $('#completedPercentage').text(completedPercent);
                    $('#completedProgress').css('width', completedPercent + '%');
                    
                    // Update in-progress students
                    $('#inProgressStudents').text(data.in_progress);
                    $('#activeToday').text(data.active_today);
                    $('#inactiveWeek').text(data.inactive_week);
                    
                    // Update scores
                    $('#averageScore').text(data.average_score.toFixed(1));
                    $('#highestScore').text(data.highest_score);
                    $('#lowestScore').text(data.lowest_score);
                    $('#scoreProgress').css('width', data.average_score + '%');
                }
            }
        });
    }

    // Load student details
    function loadStudentDetails(studentId) {
        $.ajax({
            url: '../../system/progressTracker.php',
            type: 'GET',
            data: {
                action: 'getStudentDetails',
                student_id: studentId
            },
            success: function(response) {
                if (response.success) {
                    const student = response.data.student;
                    const lessons = response.data.lessons;

                    // Update student info
                    $('.student-info').html(`
                        <h6>${student.full_name}</h6>
                        <p class="mb-0">รหัสนักเรียน: ${student.student_id} | 
                           ชั้น: ม.${student.grade_level}/${student.classroom}</p>
                    `);

                    // Update lessons progress
                    let lessonsHtml = '';
                    lessons.forEach(lesson => {
                        const status = lesson.completed ? 'completed' : 
                                     lesson.started ? 'in-progress' : 'not-started';
                        const statusText = {
                            'completed': 'เรียนจบแล้ว',
                            'in-progress': 'กำลังเรียน',
                            'not-started': 'ยังไม่เริ่ม'
                        }[status];

                        lessonsHtml += `
                            <div class="lesson-progress-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="progress-indicator ${status}"></span>
                                        <strong>${lesson.title}</strong>
                                    </div>
                                    <span class="badge bg-${status === 'completed' ? 'success' : 
                                                         status === 'in-progress' ? 'warning' : 
                                                         'danger'}">
                                        ${statusText}
                                    </span>
                                </div>
                                <div class="mt-2">
                                    <small class="text-muted">
                                        คะแนนก่อนเรียน: ${lesson.pretest_score || '-'}% | 
                                        คะแนนหลังเรียน: ${lesson.posttest_score || '-'}%
                                    </small>
                                </div>
                            </div>
                        `;
                    });
                    $('.lessons-progress').html(lessonsHtml);
                }
            }
        });
    }

    // Event Handlers
    $('#gradeFilter, #classFilter').on('change', function() {
        loadSummaryStats();
        progressTable.ajax.reload();
    });

    $(document).on('click', '.view-details', function() {
        const studentId = $(this).data('id');
        loadStudentDetails(studentId);
        $('#studentDetailsModal').modal('show');
    });

    // Initialize when page loads
    $(document).on('pageChanged', function(e, pageId) {
        if (pageId === 'fallowPage') {
            initializeTable();
            loadSummaryStats();
        }
    });

    // เพิ่ม cleanup function
    function cleanupTable() {
        try {
            if ($.fn.DataTable.isDataTable('#studentsProgressTable') && $('#studentsProgressTable').length) {
                $('#studentsProgressTable').DataTable().destroy();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    // เรียกใช้ cleanup เมื่อออกจากหน้า
    $(document).on('pageChanged', function() {
        cleanupTable();
    });
});