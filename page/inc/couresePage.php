<div class="page courses-page" id="coursesPage">
    <div class="container-fluid">
        <!-- Page Header -->
        <div class="page-header">
            <div class="d-flex justify-content-between align-items-center">
                <h2><i class="fas fa-book-open me-2"></i>จัดการบทเรียน</h2>
                <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#addCourseModal">
                    <i class="fas fa-plus"></i> เพิ่มบทเรียนใหม่
                </button>
            </div>
        </div>

        <!-- Course List -->
        <div class="row" id="coursesList">
            <!-- Course cards will be loaded here -->
        </div>

        <!-- เพิ่ม Loading Indicator -->
        <div id="loadingIndicator" class="text-center d-none">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">กำลังโหลด...</span>
            </div>
        </div>
    </div>

    <!-- Add Course Modal -->
    <div class="modal fade" id="addCourseModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">เพิ่มบทเรียนใหม่</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addCourseForm">
                        <div class="mb-3">
                            <label class="form-label">ชื่อบทเรียน</label>
                            <input type="text" class="form-control" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">หมวดหมู่</label>
                            <select class="form-select" name="category" required>
                                <option value="vegetables">ผัก</option>
                                <option value="fruits">ผลไม้</option>
                                <option value="meats">เนื้อสัตว์</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รูปภาพปก</label>
                            <input type="file" class="form-control" name="cover_image" accept="image/*">
                            <div class="form-text">ขนาดแนะนำ 400x300 pixel, ไม่เกิน 10MB</div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" id="saveCourseBtn">บันทึก</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Course Modal -->
    <div class="modal fade" id="editCourseModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">แก้ไขบทเรียน</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editCourseForm">
                        <input type="hidden" name="id">
                        <div class="mb-3">
                            <label class="form-label">ชื่อบทเรียน</label>
                            <input type="text" class="form-control" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">หมวดหมู่</label>
                            <select class="form-select" name="category" required>
                                <option value="vegetables">ผัก</option>
                                <option value="fruits">ผลไม้</option>
                                <option value="meats">เนื้อสัตว์</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รูปภาพปก</label>
                            <input type="file" class="form-control" name="cover_image" accept="image/*">
                            <div class="form-text">ขนาดแนะนำ 400x300 pixel, ไม่เกิน 10MB</div>
                            <div id="currentCoverImage" class="mt-2"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" id="updateCourseBtn">บันทึก</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Vocabulary Modal -->
    <div class="modal fade" id="vocabularyModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">จัดการคำศัพท์</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <button class="btn btn-primary" id="addVocabBtn">
                            <i class="fas fa-plus"></i> เพิ่มคำศัพท์
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table" id="vocabularyTable">
                            <thead>
                                <tr>
                                    <th>คำศัพท์ (ไทย)</th>
                                    <th>คำศัพท์ (อังกฤษ)</th>
                                    <th>คำศัพท์ (เกาหลี)</th>
                                    <th>รายละเอียด</th>
                                    <th>ตัวอย่างที่ 1</th>
                                    <th>ตัวอย่างที่ 2</th>
                                    <th>การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add/Edit Vocabulary Modal -->
    <div class="modal fade" id="vocabularyFormModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">จัดการคำศัพท์</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="vocabularyForm">
                        <input type="hidden" name="id">
                        <input type="hidden" name="lesson_id">
                        <div class="mb-3">
                            <label class="form-label">คำศัพท์ (ไทย)</label>
                            <input type="text" class="form-control" name="word_th" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">คำศัพท์ (อังกฤษ)</label>
                            <input type="text" class="form-control" name="word_en" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">คำศัพท์ (เกาหลี)</label>
                            <input type="text" class="form-control" name="word_kr" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รายละเอียด</label>
                            <input type="text" class="form-control" name="deteil_word">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ตัวอย่างที่ 1</label>
                            <input type="text" class="form-control" name="example_one">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ตัวอย่างที่ 2</label>
                            <input type="text" class="form-control" name="example_two">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รูปภาพ</label>
                            <input type="file" class="form-control" name="image" accept="image/*">
                            <div id="currentImage"></div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ไฟล์เสียง</label>
                            <input type="file" class="form-control" name="audio" accept="audio/*">
                            <div id="currentAudio"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" id="saveVocabularyBtn">บันทึก</button>
                </div>
            </div>
        </div>
    </div>
</div>