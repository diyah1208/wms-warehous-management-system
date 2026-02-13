<?php

class JobCostingModel
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db; // PDO
    }

    /* =========================
       INSERT HEADER
    ========================= */
    public function insert($data)
    {
        $sql = "INSERT INTO job_costing (
                    batch_no,
                    jc_date,
                    job_cost_account,
                    description,
                    barang_1,
                    barang_2,
                    dept,
                    project,
                    created_by
                ) VALUES (
                    :batch_no,
                    :jc_date,
                    :job_cost_account,
                    :description,
                    :barang_1,
                    :barang_2,
                    :dept,
                    :project,
                    :created_by
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':batch_no' => $data['batch_no'],
            ':jc_date' => $data['jc_date'],
            ':job_cost_account' => $data['job_cost_account'],
            ':description' => $data['description'],
            ':barang_1' => $data['barang_1'],
            ':barang_2' => $data['barang_2'] ?? null,
            ':dept' => $data['dept'],
            ':project' => $data['project'] ?? null,
            ':created_by' => $data['created_by'],
        ]);

        return $this->db->lastInsertId();
    }

    /* =========================
       FIND BY ID (DETAIL)
    ========================= */
    public function find($jc_id)
    {
        $sql = "SELECT *
                FROM job_costing
                WHERE jc_id = :jc_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':jc_id' => $jc_id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* =========================
       GET ALL (INDEX)
    ========================= */
    public function getAll()
    {
        $sql = "SELECT *
                FROM job_costing
                ORDER BY jc_id DESC";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}