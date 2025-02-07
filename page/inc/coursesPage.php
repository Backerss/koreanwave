<div class="page" id="coursesPage">
                <div class="container-fluid">
                    <!-- Course Management Header -->
                    <div class="page-header mb-4">
                        <div class="row align-items-center">
                            <div class="col-sm-6">
                                <h3 class="page-title">จัดการคอร์สเรียน</h3>
                            </div>
                            <div class="col-sm-6 text-end">
                                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCourseModal">
                                    <i class="fas fa-plus"></i> สร้างคอร์สใหม่
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Course List -->
                    <div class="row">
                        <!-- Course Card -->
                        <div class="col-md-4 mb-4">
                            <div class="card course-card">
                                <div class="card-header">
                                    <div class="dropdown float-end">
                                        <button class="btn btn-link" data-bs-toggle="dropdown">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="#" data-bs-toggle="modal"
                                                    data-bs-target="#editCourseModal"><i class="fas fa-edit"></i>
                                                    แก้ไข</a></li>
                                            <li><a class="dropdown-item text-danger" href="#"><i
                                                        class="fas fa-trash"></i> ลบ</a></li>
                                        </ul>
                                    </div>
                                    <h5 class="card-title mb-0">ภาษาเกาหลี 1</h5>
                                </div>
                                <div class="card-body">
                                    <p class="card-text">พื้นฐานภาษาเกาหลีสำหรับผู้เริ่มต้น</p>
                                    <div class="course-stats mb-3">
                                        <span><i class="fas fa-book"></i> 10 บทเรียน</span>
                                        <span><i class="fas fa-users"></i> 30 นักเรียน</span>
                                    </div>
                                    <button class="btn btn-outline-primary btn-sm w-100" data-bs-toggle="modal"
                                        data-bs-target="#manageLessonsModal">
                                        จัดการบทเรียน
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Course Modal -->
                <div class="modal fade" id="addCourseModal">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">สร้างคอร์สใหม่</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addCourseForm">
                                    <div class="mb-3">
                                        <label class="form-label">ชื่อคอร์ส</label>
                                        <input type="text" class="form-control" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">คำอธิบาย</label>
                                        <textarea class="form-control" rows="3"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">รูปภาพปก</label>
                                        <input type="file" class="form-control">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                                <button type="button" class="btn btn-primary">บันทึก</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Manage Lessons Modal -->
                <div class="modal fade" id="manageLessonsModal">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">จัดการบทเรียน - ภาษาเกาหลี 1</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                                        data-bs-target="#addLessonModal">
                                        <i class="fas fa-plus"></i> เพิ่มบทเรียน
                                    </button>
                                </div>
                                <div class="lesson-list">
                                    <div
                                        class="lesson-item d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                                        <div>
                                            <h6 class="mb-1">บทที่ 1: การทักทาย</h6>
                                            <small class="text-muted">3 หัวข้อ | 45 นาที</small>
                                        </div>
                                        <div class="lesson-actions">
                                            <button class="btn btn-sm btn-outline-primary me-2">แก้ไข</button>
                                            <button class="btn btn-sm btn-outline-danger">ลบ</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>