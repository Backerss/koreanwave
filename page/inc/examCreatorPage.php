<style>
  .exam-creator {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .exam-form {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .exam-settings {
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }

  .question-builder {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  .option-group {
    margin-top: 15px;
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .correct-answer {
    margin-top: 15px;
    padding: 15px;
    background: #e8f5e9;
    border-radius: 8px;
  }

  .shadow-hover {
    transition: box-shadow 0.3s ease-in-out;
  }

  .shadow-hover:hover {
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  }

  .question-builder {
    border: none;
    border-left: 4px solid #0d6efd;
  }

  .options-container {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .btn-check:checked + .btn-outline-success {
    background-color: #198754;
    color: white;
  }

  .card-header {
    border-bottom: 2px solid #f8f9fa;
  }

  .table > :not(caption) > * > * {
    padding: 1rem;
  }
</style>
<div class="page" id="examCreatorPage">
  <div class="container-fluid">
    <div class="row">
      <div class="col-lg-8">
        <!-- ส่วนสร้างข้อสอบ -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-edit text-primary me-2"></i>สร้างแบบทดสอบ
              </h5>
              <div class="badge bg-info">
                <i class="fas fa-info-circle me-1"></i>
                <span id="questionCount">0 ข้อ</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <i class="fas fa-info-circle me-2"></i>
              <span>แต่ละบทเรียนสามารถสร้างข้อสอบแต่ละประเภทได้เพียงครั้งเดียวเท่านั้น</span>
            </div>

            <!-- แก้ไขบรรทัดนี้ -->
            <form id="examForm">
              <!-- ส่วนตั้งค่าข้อสอบ -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="examType">
                      <option value="">เลือกประเภท</option>
                      <option value="pretest">แบบทดสอบก่อนเรียน</option>
                      <option value="posttest">แบบทดสอบหลังเรียน</option>
                    </select>
                    <label>ประเภทข้อสอบ</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="lessonSelect">
                      <option value="">เลือกบทเรียน</option>
                    </select>
                    <label>บทเรียน</label>
                  </div>
                </div>
              </div>

              <!-- รายการข้อสอบ -->
              <div id="questionList" class="questions-container"></div>

              <!-- ปุ่มควบคุม -->
              <div class="d-flex justify-content-between align-items-center mt-4">
                <button type="button" id="addQuestion" class="btn btn-outline-primary">
                  <i class="fas fa-plus me-2"></i>เพิ่มข้อสอบ
                </button>
                <button type="button" id="saveExam" class="btn btn-primary">
                  <i class="fas fa-save me-2"></i>บันทึกแบบทดสอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- ส่วนแสดงรายการข้อสอบ -->
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">
              <i class="fas fa-list text-primary me-2"></i>รายการแบบทดสอบ
            </h5>
          </div>
          <div class="card-body">
            <div class="form-floating mb-3">
              <select class="form-select" id="examListLessonSelect">
                <option value="">ทั้งหมด</option>
              </select>
              <label>กรองตามบทเรียน</label>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>บทเรียน</th>
                    <th>ประเภท</th>
                    <th class="text-center">จำนวนข้อ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody id="examListBody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Template สำหรับข้อสอบ -->
  <template id="questionTemplate">
    <div class="question-builder card shadow-hover mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center">
            <span class="question-number badge bg-primary me-2">ข้อที่ {number}</span>
            <h6 class="mb-0">คำถาม</h6>
          </div>
          <button type="button" class="btn btn-outline-danger btn-sm remove-question">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mb-3">
          <textarea class="form-control question-text" rows="2" placeholder="พิมพ์คำถาม..."></textarea>
        </div>

        <div class="options-container">
          <label class="form-label">ตัวเลือก</label>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light">A</span>
                <input type="text" class="form-control option-input" data-option="A" placeholder="ตัวเลือก A">
              </div>
            </div>
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light">B</span>
                <input type="text" class="form-control option-input" data-option="B" placeholder="ตัวเลือก B">
              </div>
            </div>
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light">C</span>
                <input type="text" class="form-control option-input" data-option="C" placeholder="ตัวเลือก C">
              </div>
            </div>
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-light">D</span>
                <input type="text" class="form-control option-input" data-option="D" placeholder="ตัวเลือก D">
              </div>
            </div>
          </div>
        </div>

        <div class="correct-answer mt-3 p-3 bg-light rounded">
          <label class="form-label d-block mb-2">เฉลย</label>
          <div class="btn-group" role="group">
            <input type="radio" class="btn-check correct-option" name="correct_{number}" value="A" id="correct_{number}_A">
            <label class="btn btn-outline-success" for="correct_{number}_A">A</label>
            <input type="radio" class="btn-check correct-option" name="correct_{number}" value="B" id="correct_{number}_B">
            <label class="btn btn-outline-success" for="correct_{number}_B">B</label>
            <input type="radio" class="btn-check correct-option" name="correct_{number}" value="C" id="correct_{number}_C">
            <label class="btn btn-outline-success" for="correct_{number}_C">C</label>
            <input type="radio" class="btn-check correct-option" name="correct_{number}" value="D" id="correct_{number}_D">
            <label class="btn btn-outline-success" for="correct_{number}_D">D</label>
          </div>
        </div>
      </div>
    </div>
  </template>
</div>