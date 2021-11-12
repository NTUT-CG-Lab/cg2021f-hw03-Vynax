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

        for (let i = 0; i < this.horizon_line; i++) {
            this.left_horizon_edges[i] = new Edge(color_hex[0]);
            this.right_horizon_edges[i] = new Edge(color_hex[2]);
            scene.add(this.left_horizon_edges[i].line);
            scene.add(this.right_horizon_edges[i].line);
        }

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
        // this.mesh = 0;
        this.file_path = file_path;
    }

    set_Location(json_data) {
        this.x1 = json_data['line_locationx_1'];
        this.x2 = json_data['line_locationx_3'];
        this.y1 = json_data['line_locationy_1'];
        this.y2 = json_data['line_locationy_2'];

        console.log("x1" + this.x1);
        console.log("x2" + this.x2);
        console.log("y1" + this.y1);
        console.log("y1" + this.y2);
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

    set_Visible(true_or_false) {
        for (let i = 0; i < this.eye_edges.length; i++) {
            this.eye_edges[i].line.visible = true_or_false;
        }
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