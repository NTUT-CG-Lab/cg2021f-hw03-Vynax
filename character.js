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

        //HW2座標的上下限
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;

        // 五條直線、九條橫線的間隔
        this.x_offset = 0;
        this.y_offset = 0;

        this.eye_now = 0; //0~7 two eyes in one camera, 4 camera
        this.eye_total = 8; //總共8隻眼睛
        this.eye_rotations = []; // 角度 ( 不是弳度 )
        this.eye_control_now = -1;

        // 左右虹膜的索引值
        this.left_index = 0;
        this.right_index = 0;

        //按下之前虹膜的角度
        this.last_angle = 0;

        //camera 總數
        this.camera_amount = 4;

        // 滑鼠座標
        this.mouse = new THREE.Vector2();

        this.mesh = 0;
        this.file_path = file_path;
    }
    init_Mesh(object) {
        this.mesh = object;
        this.mesh.position.y = - 10;

        // 左右虹膜的索引值
        this.left_index = this.mesh.skeleton.bones.findIndex(x => x.name === '左目');
        this.right_index = this.mesh.skeleton.bones.findIndex(x => x.name === '右目');

        for (let i = 0; i < this.camera_amount; i++) {
            this.eye_rotations[i] = [];
            this.eye_rotations[i][0] = 0;
            this.eye_rotations[i][1] = 0;
        }
        this.mesh.skeleton.bones[this.left_index].rotation.x = 0.5;
        console.log(this.mesh.skeleton.bones[this.left_index].rotation.x);
    }

    get_now_angle() {
        let which_camera = Math.floor(this.eye_now / 2);
        let which_eye = this.eye_now % 2;
        let angle = this.eye_rotations[which_camera][which_eye]
        console.log("which_eye:" + this.eye_now + ":" + "angle = " + angle);
    }

    get_Last_Angle() {
        let which_camera = Math.floor(this.eye_now / 2);
        let which_eye = this.eye_now % 2;
        this.last_angle = this.eye_rotations[which_camera][which_eye];
    }

    set_Angle(mouse_offset) {
        let which_camera = Math.floor(this.eye_now / 2);
        let which_eye = this.eye_now % 2;
        // mouse_offset * 360 * Math.PI / 180
        let angle_offset = mouse_offset * 45; // 原本 * 360，但是轉太多
        let angle;
        // 上下分開，下面四個左右轉，加負號是因為不加方向會跟滑鼠方向相反
        if (which_camera >= 2)
            angle = this.last_angle - angle_offset;
        else
            angle = this.last_angle + angle_offset; // 這是原本上半部的上下轉部分
        this.eye_rotations[which_camera][which_eye] = angle;
    }

    set_Eyes_Radian(which_camera) {
        if (this.mesh != 0) {
            // 上面四個上下轉
            if (which_camera < 2) {
                this.mesh.skeleton.bones[this.right_index].rotation.x = this.eye_rotations[which_camera][0] * Math.PI / 180;
                this.mesh.skeleton.bones[this.left_index].rotation.x = this.eye_rotations[which_camera][1] * Math.PI / 180;
            }
            // 下面四個左右轉
            else {
                this.mesh.skeleton.bones[this.right_index].rotation.y = this.eye_rotations[which_camera][0] * Math.PI / 180;
                this.mesh.skeleton.bones[this.left_index].rotation.y = this.eye_rotations[which_camera][1] * Math.PI / 180;
            }
        }
    }

    set_Eyes_Radian_Zero() {
        if (this.mesh != 0) {
            this.mesh.skeleton.bones[this.right_index].rotation.x = 0;
            this.mesh.skeleton.bones[this.left_index].rotation.x = 0;
            this.mesh.skeleton.bones[this.right_index].rotation.y = 0;
            this.mesh.skeleton.bones[this.left_index].rotation.y = 0;
        }
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

    override_eye_angle() {
        // 虹膜編號是由左而右，由上而下，所以0~3是上半部，4~7是下半部
        switch (this.eye_now) {
            // 第一個畫面的右眼複製到第一個畫面的左眼
            case 0:
                this.eye_rotations[0][1] = this.eye_rotations[0][0];
                this.eye_now = 1;
                break;
            // 第二個畫面的右眼複製到第二個畫面的左眼
            case 2:
                this.eye_rotations[1][1] = this.eye_rotations[1][0];
                this.eye_now = 3;
                break;
            // 第三個畫面的右眼複製到第四個畫面的左眼
            case 4:
                this.eye_rotations[3][1] = -this.eye_rotations[2][0];
                this.eye_now = 7;
                break;
            // 第四個畫面的右眼複製到第三個畫面的左眼
            case 6:
                this.eye_rotations[2][1] = -this.eye_rotations[3][0];
                this.eye_now = 5;
                break;
        }
    }

    set_Lines_invisible() {
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

    // true means eye_now + 1
    // false means eye_now - 1

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

        this.set_Lines_invisible();

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