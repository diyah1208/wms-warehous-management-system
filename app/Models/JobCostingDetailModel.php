<?php

class JobCostingDetailModel
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db; // PDO
    }

    /* =========================
       INSERT ITEM
    ========================= */
    public function insert($data)
    {
        $sql = "INSERT INTO job_costing_item (
                    jc_id,
                    part_no,
                    item_description,
                    qty,
                    unit
                ) VALUES (
                    :jc_id,
                    :part_no,
                    :item_description,
                    :qty,
                    :unit
                )";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':jc_id' => $data['jc_id'],
            ':part_no' => $data['part_no'],
            ':item_description' => $data['item_description'] ?? null,
            ':qty' => $data['qty'],
            ':unit' => $data['unit'],
        ]);
    }

    /* =========================
       GET ITEMS BY JOB COSTING
    ========================= */
    public function getByJobCosting($jc_id)
    {
        $sql = "SELECT
                    jc_item_id,
                    part_no,
                    item_description,
                    qty,
                    unit
                FROM job_costing_item
                WHERE jc_id = :jc_id
                ORDER BY jc_item_id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':jc_id' => $jc_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* =========================
       DELETE ITEMS BY JOB COSTING
    ========================= */
    public function deleteByJobCosting($jc_id)
    {
        $sql = "DELETE FROM job_costing_item WHERE jc_id = :jc_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':jc_id' => $jc_id
        ]);
    }
}