<div class="page" id="usersPage">
    <div class="container-fluid">
        <div class="page-header">
            <div class="row align-items-center">
                <div class="col">
                    <h1 class="page-title">จัดการผู้ใช้</h1>
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                        <i class="fas fa-plus"></i> เพิ่มผู้ใช้
                    </button>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <input type="text" class="form-control" id="searchInput"
                            placeholder="ค้นหาชื่อ, รหัสนักเรียน...">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="roleFilter">
                            <option value="">ทุกประเภทผู้ใช้</option>
                            <option value="student">นักเรียน</option>
                            <option value="teacher">ครู</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="gradeFilter">
                            <option value="">ทุกระดับชั้น</option>
                            <option value="1">ม.1</option>
                            <option value="2">ม.2</option>
                            <option value="3">ม.3</option>
                            <option value="4">ม.4</option>
                            <option value="5">ม.5</option>
                            <option value="6">ม.6</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="classFilter">
                            <option value="">ทุกห้องเรียน</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table id="usersTable" class="table table-hover">
                        <thead>
                            <tr>
                                <th>รหัสนักเรียน</th>
                                <th>ชื่อ-นามสกุล</th>
                                <th>อีเมล</th>
                                <th>ระดับชั้น/ห้อง</th>
                                <th>ประเภทผู้ใช้</th>
                                <th>วันที่สร้าง</th>
                                <th>วันที่แก้ไข</th>
                                <th>เพศ</th>
                                <th>ชุมนุม</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal fade" id="addUserModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">เพิ่มผู้ใช้ใหม่</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm">
                        <div class="mb-3">
                            <label class="form-label">ประเภทผู้ใช้</label>
                            <select class="form-select" name="role" required>
                                <option value="student">นักเรียน</option>
                                <option value="teacher">ครู</option>
                                <option value="admin">ผู้ดูแลระบบ</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสนักเรียน</label>
                            <input type="text" class="form-control" name="student_id">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชื่อ</label>
                            <input type="text" class="form-control" name="first_name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">นามสกุล</label>
                            <input type="text" class="form-control" name="last_name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">อีเมล</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">เพศ</label>
                            <select class="form-select" name="gender" required>
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ระดับชั้น</label>
                            <select class="form-select" name="grade_level">
                                <option value="">เลือกระดับชั้น</option>
                                <option value="1">ม.1</option>
                                <option value="2">ม.2</option>
                                <option value="3">ม.3</option>
                                <option value="4">ม.4</option>
                                <option value="5">ม.5</option>
                                <option value="6">ม.6</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ห้อง</label>
                            <select class="form-select" name="classroom">
                                <option value="">เลือกห้อง</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชุมนุม</label>
                            <select class="form-select" name="club">
                                <option value="">เลือกชุมนุม</option>
                                <?php
                                $clubQuery = $db->query("SELECT * FROM clubs ORDER BY name");
                                while ($club = $clubQuery->fetch()) {
                                    echo "<option value='{$club['name']}'>{$club['name']}</option>";
                                }
                                ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสผ่าน</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" id="saveUser">บันทึก</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">แก้ไขข้อมูลผู้ใช้</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <input type="hidden" name="id">
                        <div class="mb-3">
                            <label class="form-label">ประเภทผู้ใช้</label>
                            <select class="form-select" name="role" required>
                                <option value="student">นักเรียน</option>
                                <option value="teacher">ครู</option>
                                <option value="admin">ผู้ดูแลระบบ</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสนักเรียน</label>
                            <input type="text" class="form-control" name="student_id">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชื่อ</label>
                            <input type="text" class="form-control" name="first_name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">นามสกุล</label>
                            <input type="text" class="form-control" name="last_name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">อีเมล</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">เพศ</label>
                            <select class="form-select" name="gender" required>
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ระดับชั้น</label>
                            <select class="form-select" name="grade_level">
                                <option value="">เลือกระดับชั้น</option>
                                <option value="1">ม.1</option>
                                <option value="2">ม.2</option>
                                <option value="3">ม.3</option>
                                <option value="4">ม.4</option>
                                <option value="5">ม.5</option>
                                <option value="6">ม.6</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ห้อง</label>
                            <select class="form-select" name="classroom">
                                <option value="">เลือกห้อง</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชุมนุม</label>
                            <select class="form-select" name="club">
                                <option value="">เลือกชุมนุม</option>
                                <?php
                                $clubQuery = $db->query("SELECT * FROM clubs ORDER BY name");
                                while ($club = $clubQuery->fetch()) {
                                    echo "<option value='{$club['name']}'>{$club['name']}</option>";
                                }
                                ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสผ่านใหม่ (เว้นว่างถ้าไม่ต้องการเปลี่ยน)</label>
                            <input type="password" class="form-control" name="password">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" id="updateUser">บันทึก</button>
                </div>
            </div>
        </div>
    </div>
</div>