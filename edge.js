// 邊框

import * as THREE from './build/three.module.js';

export class Edge {
    constructor(color_hex) {
        this.points = [];
        this.points[0] = new THREE.Vector3(0, 0, 0);
        this.points[1] = new THREE.Vector3(0, 0, 0);
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.material = new THREE.LineBasicMaterial({ color: color_hex });
        this.line = new THREE.Line(this.geometry, this.material);
        this.line.frustumCulled = false;
    }
    set_Line_Points(point1, point2) {
        this.points[0].set(point1.x, point1.y, point1.z);
        this.points[1].set(point2.x, point2.y, point2.z);
        this.geometry.setFromPoints(this.points);
    }
}