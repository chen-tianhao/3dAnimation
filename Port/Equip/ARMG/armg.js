import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const FRAME_COLOR = 0xff6a00;
const WALKWAY_COLOR = 0x4a5363;
const CABLE_COLOR = 0x222833;

export class ARMGCrane {
  constructor(options = {}) {
    const {
      railSpan = 40,
      hoistHeight = 18.2,
      cantilever = 7.5,
      trolleyWidth = 6.0,
    } = options;

    this.railSpan = railSpan;
    this.hoistHeight = hoistHeight;
    this.cantilever = cantilever;
    this.trolleyWidth = trolleyWidth;

    this.halfSpan = railSpan / 2;
    this.legClearance = 4; // extra headroom above the rated hoisting height
    this.crossbeamElevation = this.hoistHeight + this.legClearance;
    this.maxHoistDepth = this.crossbeamElevation - 0.5;

    this.group = new THREE.Group();
    this.group.name = "ARMGCrane";

    this._buildStructure();
  }

  _buildStructure() {
    const verticalLegGeometry = new THREE.BoxGeometry(1.6, this.crossbeamElevation, 2.4);
    const legMaterial = new THREE.MeshStandardMaterial({ color: FRAME_COLOR, metalness: 0.35, roughness: 0.6 });

    const leftLeg = new THREE.Mesh(verticalLegGeometry, legMaterial);
    leftLeg.position.set(-this.halfSpan, this.crossbeamElevation / 2, -1.5);

    const rightLeg = new THREE.Mesh(verticalLegGeometry, legMaterial);
    rightLeg.position.set(this.halfSpan, this.crossbeamElevation / 2, 1.5);

    leftLeg.castShadow = rightLeg.castShadow = true;
    leftLeg.receiveShadow = rightLeg.receiveShadow = true;

    this.group.add(leftLeg, rightLeg);

    // lower girders connecting the legs
    const lowerGirderGeometry = new THREE.BoxGeometry(this.railSpan, 1.2, 1.2);
    const lowerGirder = new THREE.Mesh(lowerGirderGeometry, legMaterial);
    lowerGirder.position.set(0, 0.6, 0);
    lowerGirder.castShadow = lowerGirder.receiveShadow = true;
    this.group.add(lowerGirder);

    // upper cross beam with slight cantilever
    const crossBeamGeometry = new THREE.BoxGeometry(this.railSpan + this.cantilever, 1.2, 2.2);
    const crossBeam = new THREE.Mesh(crossBeamGeometry, legMaterial);
    crossBeam.position.set(this.cantilever / 2, this.crossbeamElevation, 0);
    crossBeam.castShadow = crossBeam.receiveShadow = true;
    this.group.add(crossBeam);

    // walkway on top of cross beam
    const walkwayGeometry = new THREE.BoxGeometry(this.railSpan + this.cantilever, 0.2, 3.2);
    const walkwayMaterial = new THREE.MeshStandardMaterial({ color: WALKWAY_COLOR, metalness: 0.2, roughness: 0.8 });
    const walkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
    walkway.position.set(this.cantilever / 2, this.crossbeamElevation + 0.7, 0);
    walkway.receiveShadow = true;
    this.group.add(walkway);

    // trolley assembly suspended under the cross beam
  this.trolleyGroup = new THREE.Group();
  this.trolleyGroup.position.set(0, this.crossbeamElevation - 0.6, 0);

    const trolleyFrameGeometry = new THREE.BoxGeometry(this.trolleyWidth, 1.2, 3.6);
    const trolleyFrame = new THREE.Mesh(trolleyFrameGeometry, legMaterial);
    trolleyFrame.castShadow = trolleyFrame.receiveShadow = true;

    const trolleyWheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, this.trolleyWidth, 16);
    const trolleyWheelMaterial = new THREE.MeshStandardMaterial({ color: WALKWAY_COLOR, metalness: 0.3, roughness: 0.4 });
    const wheels = new THREE.Group();

    for (let i = 0; i < 4; i += 1) {
      const wheel = new THREE.Mesh(trolleyWheelGeometry, trolleyWheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      const offsetX = (i < 2 ? -1 : 1) * (this.trolleyWidth / 2 - 0.6);
      const offsetZ = i % 2 === 0 ? -1.6 : 1.6;
      wheel.position.set(offsetX, 0.6, offsetZ);
      wheel.castShadow = wheel.receiveShadow = true;
      wheels.add(wheel);
    }

    this.trolleyGroup.add(trolleyFrame, wheels);

    // hoist / spreader group (moves vertically)
    this.hoistGroup = new THREE.Group();
    this.hoistGroup.position.set(0, -1.4, 0);

    // hoist cables (visual only)
    const cableMaterial = new THREE.MeshStandardMaterial({ color: CABLE_COLOR, metalness: 0.6, roughness: 0.2 });
    const cableGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 12);

    this.cableMeshes = [];
    const cableOffsets = [
      [-this.trolleyWidth / 2 + 0.8, 0, -1.1],
      [this.trolleyWidth / 2 - 0.8, 0, -1.1],
      [-this.trolleyWidth / 2 + 0.8, 0, 1.1],
      [this.trolleyWidth / 2 - 0.8, 0, 1.1],
    ];

    cableOffsets.forEach(([x, , z]) => {
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.rotation.x = Math.PI / 2;
      cable.position.set(x, -0.75, z);
      this.cableMeshes.push(cable);
      this.trolleyGroup.add(cable);
    });

    // spreader frame
    const spreaderGeometry = new THREE.BoxGeometry(this.trolleyWidth - 1.2, 0.5, 2.8);
    const spreaderMaterial = new THREE.MeshStandardMaterial({ color: 0xe8aa14, metalness: 0.4, roughness: 0.5 });
    this.spreader = new THREE.Mesh(spreaderGeometry, spreaderMaterial);
    this.spreader.castShadow = this.spreader.receiveShadow = true;

    this.spreaderGroup = new THREE.Group();
    this.spreaderGroup.add(this.spreader);
    this.spreaderGroup.position.set(0, -1.5, 0);

  this.hoistGroup.add(this.spreaderGroup);
  this.trolleyGroup.add(this.hoistGroup);
    this.group.add(this.trolleyGroup);

  const spreaderHalfHeight = (this.spreader.geometry?.parameters?.height || 0.5) / 2;
  this.spreaderBottomOffset = Math.abs(this.spreaderGroup.position.y) + spreaderHalfHeight;

    // create rails to visually show the crane's travel path
    const railMaterial = new THREE.MeshStandardMaterial({ color: WALKWAY_COLOR, metalness: 0.2, roughness: 0.7 });
    const railGeometry = new THREE.BoxGeometry(this.railSpan + this.cantilever, 0.25, 0.6);

    const frontRail = new THREE.Mesh(railGeometry, railMaterial);
    frontRail.position.set(this.cantilever / 2, 0.12, -4);
    const backRail = frontRail.clone();
    backRail.position.z = 4;

    frontRail.receiveShadow = backRail.receiveShadow = true;
    this.group.add(frontRail, backRail);
  }

  setTrolleyPosition(localX) {
    const limit = this.halfSpan;
    this.trolleyGroup.position.x = THREE.MathUtils.clamp(localX, -limit, limit + this.cantilever);
  }

  setHoistDepth(depth) {
    const clamped = THREE.MathUtils.clamp(depth, 0, this.maxHoistDepth);
    this.hoistGroup.position.y = -clamped;

    const cableLength = Math.max(1.4, clamped + 1.4);
    this.cableMeshes.forEach((mesh) => {
      mesh.scale.y = cableLength / 1.5;
      mesh.position.y = -cableLength / 2;
    });
  }

  setSpreaderYaw(radians) {
    this.spreaderGroup.rotation.y = radians;
  }

  attachContainer(container) {
    if (!container) return;
    this.attachedContainer = container;
    this.spreaderGroup.add(container);
    container.position.set(0, -container.geometry.parameters.height / 2 - 0.25, 0);
  }

  detachContainer(targetParent, targetPosition) {
    if (!this.attachedContainer) return;
    const released = this.attachedContainer;
    if (targetParent) {
      targetParent.add(released);
    }
    if (targetPosition) {
      released.position.copy(targetPosition);
    }
    this.attachedContainer = null;
    return released;
  }
}
