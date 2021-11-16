// 角色

import { Edge } from './edge.js';
import * as THREE from './build/three.module.js';

export class Character {
    constructor(scene, file_path, line_amount, color_hex) {
        this.eye_edges = [];
        this.horizon_line = 5;
        this.vertical_line = 9;
        this.left_horizon_edges = [];
        this.left_vertical_edges = [];
        this.right_horizon_edges = [];
        this.right_vertical_edges = [];

        //左右各5條橫線
        for (let i = 0; i < this.horizon_line; i++) {
            this.left_horizon_edges[i] = new Edge(color_hex[0]);
            this.right_horizon_edges[i] = new Edge(color_hex[2]);
            scene.add(this.left_horizon_edges[i].line);
            scene.add(this.right_horizon_edges[i].line);
        }
        //左右各9條直線
        for (let i = 0; i < this.vertical_line; i++) {
            this.left_vertical_edges[i] = new Edge(color_hex[1]);
            this.right_vertical_edges[i] = new Edge(color_hex[3]);
            scene.add(this.left_vertical_edges[i].line);
            scene.add(this.right_vertical_edges[i].line);
        }

        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;

        this.x_offset = 0;
        this.y_offset = 0;

        this.eye_now = 0; //0~7 two eyes in one camera, 4 camera
        this.eye_total = 8; //總共8隻眼睛
        this.eye_rotations = [];
        this.left_eye_index = 0;
        this.right_eye_index = 0;
        this.mesh = 0;
        this.file_path = file_path;
    }
    init_Mesh(object) {
        this.mesh = object;
        this.mesh.position.y = - 10;

        this.left_eye_index = this.mesh.skeleton.bones.findIndex(x => x.name === '左目');
        this.right_eye_index = this.mesh.skeleton.bones.findIndex(x => x.name === '右目');
    }

    set_Location(json_data) {
        this.x1 = json_data['line_locationx_1'];
        this.x2 = json_data['line_locationx_3'];
        this.y1 = json_data['line_locationy_1'];
        this.y2 = json_data['line_locationy_2'];

        console.log("x1:" + this.x1);
        console.log("x2:" + this.x2);
        console.log("y1:" + this.y1);
        console.log("y2:" + this.y2);

        //每條線的偏移量
        this.x_offset = Math.abs(this.x2 - this.x1) / 8;
        this.y_offset = Math.abs(this.y2 - this.y1) / 4;

        let temp_Vector3 = [];
        temp_Vector3[0] = new THREE.Vector3();
        temp_Vector3[1] = new THREE.Vector3();

        //左右各5橫線
        for (let i = 0; i < this.horizon_line; i++) {
            let y_temp = this.y1 + i * this.y_offset;
            temp_Vector3[0].set(0, y_temp, 20);
            temp_Vector3[1].set(10, y_temp, 20);
            this.left_horizon_edges[i].set_Line_Points(temp_Vector3[0], temp_Vector3[1]);
            temp_Vector3[0].set(0, y_temp, 20);
            temp_Vector3[1].set(-10, y_temp, 20);
            this.right_horizon_edges[i].set_Line_Points(temp_Vector3[0], temp_Vector3[1]);
        }
        let y_mid = (this.y1 + this.y2) / 2;

        //左右各9條直線
        for (let i = 0; i < this.vertical_line; i++) {
            let x_temp = this.x1 + i * this.x_offset;
            temp_Vector3[0].set(x_temp, y_mid - 5, 20);
            temp_Vector3[1].set(x_temp, y_mid + 5, 20);
            this.left_vertical_edges[i].set_Line_Points(temp_Vector3[0], temp_Vector3[1]);
            temp_Vector3[0].set(-x_temp, y_mid - 5, 20);
            temp_Vector3[1].set(-x_temp, y_mid + 5, 20);
            this.right_vertical_edges[i].set_Line_Points(temp_Vector3[0], temp_Vector3[1]);
        }

    }

    set_Line_Points(edge_now, point1, point2) {
        this.eye_edges[edge_now].set_Line_Points(point1, point2);
    }

    left_copy_to_right(line_amount) {
        let temp_Vector3 = [];
        for (let i = line_amount; i < line_amount * 2; i++) {
            temp_Vector3[0] = new THREE.Vector3().copy(this.eye_edges[i - line_amount].points[0]);
            temp_Vector3[1] = new THREE.Vector3().copy(this.eye_edges[i - line_amount].points[1]);


            temp_Vector3[0].setX(-temp_Vector3[0].x);
            temp_Vector3[1].setX(-temp_Vector3[1].x);

            this.eye_edges[i].set_Line_Points(temp_Vector3[0], temp_Vector3[1]);

            // console.log("1:" + this.eye_edges[i - line_amount].points[0].x + "2:" + this.eye_edges[i - line_amount].points[1].x);
        }
    }

    // true means eye_now + 1
    // false means eye_now - 1

    reset() {
        //左右各5條橫線
        for (let i = 0; i < this.horizon_line; i++) {
            this.left_horizon_edges[i].line.visible = false;
            this.right_horizon_edges[i].line.visible = false;
        }
        //左右各9條直線
        for (let i = 0; i < this.vertical_line; i++) {
            this.left_vertical_edges[i].line.visible = false;
            this.right_vertical_edges[i].line.visible = false;
        }
    }

    change_Eye(true_or_false) {
        if (!true_or_false) {
            if (this.eye_now - 1 < 0)
                this.eye_now = 0;
            else
                this.eye_now = this.eye_now - 1;
        }
        else {
            // total 8 eyes, 0~7
            if (this.eye_now + 1 > this.eye_total - 1)
                this.eye_now = this.eye_total - 1;
            else
                this.eye_now = this.eye_now + 1;
        }
        this.set_Visible(true);
    }

    set_Visible(true_or_false) {

        //左右各5條橫線
        for (let i = 0; i < this.horizon_line; i++) {
            this.left_horizon_edges[i].line.visible = false;
            this.right_horizon_edges[i].line.visible = false;
        }
        //左右各9條直線
        for (let i = 0; i < this.vertical_line; i++) {
            this.left_vertical_edges[i].line.visible = false;
            this.right_vertical_edges[i].line.visible = false;
        }

        // right eye
        if (true_or_false) {
            if (this.eye_now % 2 == 0) {
                // horizon lines
                for (let i = 0; i < this.horizon_line; i++) {
                    this.right_horizon_edges[i].line.visible = true_or_false;
                }

                // vertical lines
                for (let i = 0; i < this.vertical_line; i++) {
                    this.right_vertical_edges[i].line.visible = true_or_false;
                }
            }
            // left eye
            else {
                //horizon lines
                for (let i = 0; i < this.horizon_line; i++) {
                    this.left_horizon_edges[i].line.visible = true_or_false;
                }
                // vertical lines
                for (let i = 0; i < this.vertical_line; i++) {
                    this.left_vertical_edges[i].line.visible = true_or_false;
                }
            }
        }
        if (this.mesh != 0)
            this.mesh.visible = true_or_false;
    }

    make_JSON_point() {
        let jsonData = {};
        jsonData["location"] = this.file_path;

        let prefix = "line_location";
        let column_name, x_or_y;


        // 左邊直線 的 x 搭配下方邊框的 y
        jsonData[prefix + "x_1"] = this.eye_edges[1].points[0].x;
        jsonData[prefix + "y_1"] = this.eye_edges[0].points[0].y;

        // 左邊直線 的 x 搭配上方邊框的 y
        jsonData[prefix + "x_2"] = this.eye_edges[1].points[0].x;
        jsonData[prefix + "y_2"] = this.eye_edges[2].points[0].y;

        // 右邊直線 的 x 搭配上方邊框的 y
        jsonData[prefix + "x_3"] = this.eye_edges[3].points[0].x;
        jsonData[prefix + "y_3"] = this.eye_edges[2].points[0].y;

        // 右邊直線 的 x 搭配下方邊框的 y
        jsonData[prefix + "x_4"] = this.eye_edges[3].points[0].x;
        jsonData[prefix + "y_4"] = this.eye_edges[0].points[0].y;

        return jsonData;
    }
}