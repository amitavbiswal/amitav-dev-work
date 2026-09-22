(function () {
  // 3D scenes for chemistry/molecules: addTutorialScenes3D('chemistry', 'molecules', [...8 scenes...]).

  // ---------------------------------------------------------------- shared helpers
  const ELEC = '#4f46e5', PROTON = '#dc2626', ORANGE = '#f97316', STICK = '#cbd5e1';
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // per-view cache (geometries / materials shared inside one scene)
  function cache(view, key, make) {
    view.__mol = view.__mol || {};
    return view.__mol[key] || (view.__mol[key] = make());
  }
  const matOf = (view, col, o) => cache(view, 'm' + col + JSON.stringify(o || {}), () => view.mat(col, o));
  const cylGeo = view => cache(view, 'cyl', () => new THREE.CylinderGeometry(1, 1, 1, 16));

  // Text overlay (crisp DOM text) on top of the canvas.
  function overlay(view, html, style) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;pointer-events:none;font-size:0.76rem;font-weight:700;line-height:1.25;color:var(--t-ink,#1f2937);' +
      'text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 5px #fff;' + (style || '');
    d.innerHTML = html;
    view.wrap.appendChild(d);
    return d;
  }

  // Gentle camera sway that keeps "left / right" meaning (added on top of whatever the user did).
  function sway(view, amp, speed) {
    let prev = 0;
    return t => { const v = amp * Math.sin(t * speed); view.cam.yaw += v - prev; prev = v; };
  }

  // Set opacity of a whole object tree that owns its own materials.
  function setBtnOn(row, id) {
    row.querySelectorAll('button').forEach(b => {
      const on = b.id === id;
      b.style.borderColor = on ? 'var(--primary)' : '';
      b.style.color = on ? 'var(--primary)' : '';
    });
  }

  // ---------------------------------------------------------------- ball-and-stick molecules (true 3D geometry)
  // spec: { atoms: [[sym, x, y, z], ...], links: [[a, b, order], ...] }
  function tetraDir(u, k, phi0) {   // k-th of the 3 other tetrahedral bond directions at an atom entered along unit vector u
    const e1 = Math.abs(u.y) < 0.9 ? V3(0, 1, 0).cross(u).normalize() : V3(1, 0, 0).cross(u).normalize();
    const e2 = u.clone().cross(e1).normalize();
    const p = phi0 + (2 * Math.PI * k) / 3;
    return u.clone().multiplyScalar(1 / 3).add(e1.multiplyScalar(Math.cos(p) * 0.9428)).add(e2.multiplyScalar(Math.sin(p) * 0.9428)).normalize();
  }

  function centred(spec) {
    const c = V3(0, 0, 0);
    spec.atoms.forEach(a => c.add(V3(a[1], a[2], a[3])));
    c.multiplyScalar(1 / spec.atoms.length);
    return { atoms: spec.atoms.map(a => [a[0], a[1] - c.x, a[2] - c.y, a[3] - c.z]), links: spec.links };
  }

  const SPECS = {
    h2o: centred((() => {
      const half = 52.25 * Math.PI / 180, L = 1.5;
      return { atoms: [['O', 0, 0, 0], ['H', L * Math.sin(half), -L * Math.cos(half), 0], ['H', -L * Math.sin(half), -L * Math.cos(half), 0]], links: [[0, 1, 1], [0, 2, 1]] };
    })()),
    co2: centred({ atoms: [['C', 0, 0, 0], ['O', -1.75, 0, 0], ['O', 1.75, 0, 0]], links: [[0, 1, 2], [0, 2, 2]] }),
    ch4: centred((() => {
      const k = 1.45 / Math.sqrt(3);
      return { atoms: [['C', 0, 0, 0], ['H', k, k, k], ['H', k, -k, -k], ['H', -k, k, -k], ['H', -k, -k, k]], links: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] };
    })()),
    o2: centred({ atoms: [['O', -0.9, 0, 0], ['O', 0.9, 0, 0]], links: [[0, 1, 2]] }),
    glu: centred((() => {
      // beta-D-glucopyranose in a chair: ring O5, C1..C5; every OH / CH2OH equatorial, the H atoms axial
      const atoms = [], links = [];
      const add = (sym, p) => { atoms.push([sym, p.x, p.y, p.z]); return atoms.length - 1; };
      const R = 1.45, h = 0.27, ring = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3, s = i % 2 ? -1 : 1;
        ring.push(add(i === 0 ? 'O' : 'C', V3(R * Math.cos(a), s * h, R * Math.sin(a))));
      }
      for (let i = 0; i < 6; i++) links.push([ring[i], ring[(i + 1) % 6], 1]);
      for (let i = 1; i < 6; i++) {
        const a = (i * Math.PI) / 3, s = i % 2 ? -1 : 1;
        const P = V3(R * Math.cos(a), s * h, R * Math.sin(a));
        const rad = V3(Math.cos(a), 0, Math.sin(a)), tang = V3(-Math.sin(a), 0, Math.cos(a));
        const eq = rad.clone().add(V3(0, -s * 0.33, 0)).normalize();
        const hAx = add('H', P.clone().add(V3(0, s * 1.02, 0)));
        links.push([ring[i], hAx, 1]);
        if (i < 5) {
          const o = add('O', P.clone().add(eq.clone().multiplyScalar(1.43)));
          links.push([ring[i], o, 1]);
          const hd = eq.clone().multiplyScalar(0.35).add(tang.clone().multiplyScalar(0.75 * (i % 2 ? 1 : -1))).add(V3(0, s * 0.3, 0)).normalize();
          const hh = add('H', atoms[o] ? V3(atoms[o][1], atoms[o][2], atoms[o][3]).add(hd.multiplyScalar(0.98)) : P);
          links.push([o, hh, 1]);
        } else {
          const c6p = P.clone().add(eq.clone().multiplyScalar(1.52));
          const c6 = add('C', c6p);
          links.push([ring[i], c6, 1]);
          const u = eq.clone();
          const d0 = tetraDir(u, 0, 0.6), d1 = tetraDir(u, 1, 0.6), d2 = tetraDir(u, 2, 0.6);
          const o6p = c6p.clone().add(d0.clone().multiplyScalar(1.43));
          const o6 = add('O', o6p); links.push([c6, o6, 1]);
          const hA = add('H', c6p.clone().add(d1.multiplyScalar(1.02))); links.push([c6, hA, 1]);
          const hB = add('H', c6p.clone().add(d2.multiplyScalar(1.02))); links.push([c6, hB, 1]);
          const hd = tetraDir(d0, 0, 1.2);
          const hO = add('H', o6p.clone().add(hd.multiplyScalar(0.98))); links.push([o6, hO, 1]);
        }
      }
      return { atoms, links };
    })())
  };

  // Builds a rotatable group holding the atoms and bonds. Returns a handle with tick(t, amp) for vibration + pop-in.
  function buildMolecule(view, spec, o) {
    o = o || {};
    const group = new THREE.Group();
    view.scene.add(group);
    const atoms = spec.atoms.map(([sym, x, y, z], i) => {
      const r = view.radius(sym);
      const m = view.sphere(r, view.color(sym));
      m.position.set(x, y, z);
      group.add(m);
      m.userData = { base: V3(x, y, z), r, ph: i * 1.9 + 0.7, sym, pop: 1 };
      return m;
    });
    const cg = cylGeo(view), sm = matOf(view, STICK, { shininess: 40 });
    const bonds = spec.links.map(([a, b, order]) => {
      const parts = [];
      for (let i = 0; i < order; i++) { const m = new THREE.Mesh(cg, sm); group.add(m); parts.push(m); }
      return { a: atoms[a], b: atoms[b], order, parts, rad: order === 1 ? 0.1 : 0.075, spread: 0.22 };
    });
    const up = V3(0, 1, 0), tmpD = V3(0, 0, 0), tmpS = V3(0, 0, 0), tmpM = V3(0, 0, 0);
    function tick(t, amp) {
      amp = amp == null ? 0.035 : amp;
      atoms.forEach(m => {
        const u = m.userData, k = u.sym === 'H' ? 1.6 : 1;
        m.position.set(
          u.base.x + amp * k * Math.sin(t * 6.1 + u.ph), u.base.y + amp * k * Math.sin(t * 5.3 + u.ph * 1.7), u.base.z + amp * k * Math.sin(t * 4.7 + u.ph * 0.6));
        m.scale.setScalar(Math.max(0.0001, u.r * u.pop));
        m.visible = u.pop > 0.01;
      });
      bonds.forEach(bd => {
        const pf = Math.min(bd.a.userData.pop, bd.b.userData.pop);
        tmpD.copy(bd.b.position).sub(bd.a.position);
        const len = tmpD.length();
        tmpD.multiplyScalar(1 / Math.max(len, 1e-4));
        tmpS.set(0, 0, 1).cross(tmpD);
        if (tmpS.lengthSq() < 1e-4) tmpS.set(1, 0, 0).cross(tmpD);
        tmpS.normalize();
        tmpM.copy(bd.a.position).add(bd.b.position).multiplyScalar(0.5);
        bd.parts.forEach((m, i) => {
          const off = (i - (bd.order - 1) / 2) * bd.spread;
          m.position.copy(tmpM).addScaledVector(tmpS, off);
          m.scale.set(bd.rad * pf, len, bd.rad * pf);
          m.quaternion.setFromUnitVectors(up, tmpD);
          m.visible = pf > 0.05;
        });
      });
    }
    tick(0, 0);
    return { group, atoms, bonds, tick, spec };
  }

  // ================================================================ STEP 1: two H atoms share an electron pair
  const scene1 = Chem3D.define({ distance: 9.4, pitch: 0.3, yaw: 0.35, autoRotate: 0.12, target: [0, -0.3, 0] }, (view, ctx) => {
    const R = 1.3;
    const cloudMat = () => view.mat('#818cf8', { opacity: 0.24, shininess: 10 });
    const mkAtom = tilt => {
      const g = new THREE.Group();
      view.scene.add(g);
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), cloudMat());
      cloud.scale.setScalar(R);
      const nuc = view.sphere(0.3, PROTON, { shininess: 90 });
      const el = view.sphere(0.19, ELEC, { emissive: '#3730a3' });
      const orbit = view.ring(R * 0.78, '#a5b4fc', { axis: 'z', opacity: 0.5, tube: 0.012 });
      orbit.rotation.set(tilt[0], tilt[1], 0);
      g.add(cloud, nuc, orbit);
      view.scene.add(el);
      return { g, cloud, nuc, el, orbit, tilt };
    };
    const A = mkAtom([1.0, 0.4]), B = mkAtom([-0.9, 0.7]);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), view.mat('#6366f1', { opacity: 0.0, shininess: 10 }));
    view.scene.add(lens);
    const lblA = view.label('H', [0, 1.9, 0], { size: 0.8, color: '#1f2937' });
    const lblB = view.label('H', [0, 1.9, 0], { size: 0.8, color: '#1f2937' });
    const lblM = view.label('H₂ molecule', [0, 2.0, 0], { size: 0.9, color: '#4f46e5' });
    const cap = overlay(view, '', 'left:0;right:0;top:4px;text-align:center;');
    const qv = V3(0, 0, 0);
    const orbitPos = (atom, ang, out) => {   // electron on the atom's tilted circular orbit (world position)
      const r = R * 0.78;
      out.set(r * Math.cos(ang), r * Math.sin(ang), 0).applyEuler(atom.orbit.rotation).add(atom.g.position);
      return out;
    };
    const pa = V3(0, 0, 0), pb = V3(0, 0, 0);
    let lastCap = '';
    view.run((t, dt) => {
      const c = t % 10;
      const p = c < 3 ? ease(c / 3) : c < 7 ? 1 : 1 - ease((c - 7) / 2.5);
      const blend = ease((c - 2.6) / 0.8) * (1 - ease((c - 7) / 0.6));
      const half = mix(2.7, 0.68, p);
      A.g.position.set(-half, 0, 0); B.g.position.set(half, 0, 0);
      const pulse = 1 + 0.06 * Math.sin(t * 4);
      A.nuc.scale.setScalar(0.3 * pulse); B.nuc.scale.setScalar(0.3 * pulse);
      A.orbit.material.opacity = B.orbit.material.opacity = 0.5 * (1 - blend);
      lens.material.opacity = 0.2 * blend;
      lens.position.set(0, 0, 0);
      lens.scale.set(half + R * 0.95, R * 0.8, R * 0.8);
      [[A, 0, pa], [B, Math.PI, pb]].forEach(([atom, ph, out]) => {
        orbitPos(atom, 2.2 * t + ph + 1, out);
        // shared orbit: a long ellipse round BOTH nuclei, tilted in 3D
        const s = 3 * t + ph, a = half + 0.75, b = 0.85;
        qv.set(a * Math.cos(s), b * Math.sin(s) * Math.cos(0.7), b * Math.sin(s) * Math.sin(0.7) + 0.35 * Math.sin(s * 2));
        atom.el.position.copy(out).lerp(qv, blend);
      });
      lblA.position.set(-half, 1.9, 0); lblB.position.set(half, 1.9, 0);
      lblA.material.opacity = lblB.material.opacity = 1 - blend;
      lblM.material.opacity = blend;
      const txt = blend > 0.5 ? '<span style="color:var(--primary)">Shared pair = covalent bond</span>' : 'Each H atom has 1 electron and wants 2.';
      if (txt !== lastCap) { cap.innerHTML = txt; lastCap = txt; }
    });
  });

  // ================================================================ STEP 2: water is bent
  const scene2 = Chem3D.define({ distance: 6.6, pitch: 0.3, yaw: 0.25, autoRotate: 0.22, target: [0.5, 0.55, 0] }, (view, ctx) => {
    const mol = buildMolecule(view, SPECS.h2o);
    mol.group.rotation.x = 0.35;            // tilt the molecule plane a little so its depth shows straight away
    const [O, H1, H2] = mol.atoms;
    const o0 = O.userData.base, L = 1.5, half0 = 52.25 * Math.PI / 180;
    // dashed 3D arc for the 104.5 degree angle, drawn in the molecule's plane (child of the same group)
    const segs = 9, arcR = 0.95, span = 104.5 * Math.PI / 180;
    const segGeo = new THREE.TorusGeometry(arcR, 0.028, 8, 10, span / (segs * 2 - 1));
    const arcMat = view.mat(ORANGE, { shininess: 30 });
    for (let i = 0; i < segs; i++) {
      const m = new THREE.Mesh(segGeo, arcMat);
      m.rotation.z = -Math.PI / 2 - span / 2 + i * 2 * span / (segs * 2 - 1);
      m.position.copy(o0);
      mol.group.add(m);
    }
    const lo = view.label('O', [0, 0, 0], { size: 0.7, color: '#ffffff' });
    O.add(lo); lo.scale.multiplyScalar(1 / O.scale.x);
    [H1, H2].forEach(h => { const l = view.label('H', [0, 0, 0], { size: 0.6, color: '#1f2937' }); h.add(l); l.scale.multiplyScalar(1 / h.scale.x); });
    const angLbl = view.label('104.5°', [0, 0, 0], { size: 0.7, color: '#c2410c' });
    mol.group.add(angLbl);
    angLbl.position.set(o0.x, o0.y - arcR - 0.55, 0);
    overlay(view, '<div style="font-size:1.7rem;color:var(--primary);line-height:1">H₂O</div>2 hydrogen atoms<br>1 oxygen atom<br><span style="color:var(--t-orange,#c2410c)">Bent: about 104.5°</span>', 'left:8px;top:6px;');
    view.run((t, dt) => {
      const sw = 3.2 * Math.PI / 180 * Math.sin(t * 2.6);   // gentle swaying of the H atoms about the oxygen
      const st = 1 + 0.025 * Math.sin(t * 5.2);
      H1.userData.base.set(o0.x + L * st * Math.sin(half0 + sw), o0.y - L * st * Math.cos(half0 + sw), 0);
      H2.userData.base.set(o0.x - L * st * Math.sin(half0 + sw), o0.y - L * st * Math.cos(half0 + sw), 0);
      mol.tick(t, 0.012);
    });
  });

  // ================================================================ STEP 3: ionic bond, Na gives an electron to Cl
  const scene3 = Chem3D.define({ distance: 11.8, pitch: 0.28, yaw: 0.3, autoRotate: 0.1, target: [0, -0.45, 0] }, (view, ctx) => {
    const radii = [0.65, 1.3, 2.0], speeds = [1.5, 1.0, 0.7];
    const tilts = [[1.1, 0.2, 0], [-0.55, 0.9, 0], [0.5, -0.4, 0.3]];
    const mkAtom = (counts, outerSlots) => {
      const g = new THREE.Group();
      view.scene.add(g);
      const nuc = view.sphere(0.42, PROTON, { shininess: 90 });
      g.add(nuc);
      const shells = radii.map((r, s) => {
        const sg = new THREE.Group();
        sg.rotation.set(...tilts[s]);
        g.add(sg);
        const ring = view.ring(r, '#a5b4fc', { axis: 'z', opacity: 0.6, tube: 0.014 });
        sg.add(ring);
        return { sg, ring, r };
      });
      const dots = [];
      counts.forEach((n, s) => {
        const slots = s === 2 ? outerSlots : n;
        for (let k = 0; k < n; k++) {
          const e = view.sphere(0.16, ELEC, { emissive: '#3730a3' });
          shells[s].sg.add(e);
          dots.push({ s, k, slots, e });
        }
      });
      return { g, nuc, shells, dots };
    };
    const na = mkAtom([2, 8, 1], 1);
    const cl = mkAtom([2, 8, 7], 8);
    cl.dots.forEach(d => { if (d.s === 2) d.k += 1; });      // slot 0 of chlorine's outer shell stays open
    const mover = na.dots[na.dots.length - 1];
    mover.e.material.color.set(ORANGE); mover.e.material.emissive.set('#c2410c'); mover.e.scale.setScalar(0.19);
    na.shells[2].sg.remove(mover.e); view.scene.add(mover.e);
    const angle = (d, t) => d.s * 0.9 + (2 * Math.PI * d.k) / d.slots + speeds[d.s] * t;
    const nameNa = view.label('Na', [0, -2.45, 0], { size: 1.0, color: '#6d28d9' });
    const nameCl = view.label('Cl', [0, -2.45, 0], { size: 1.0, color: '#15803d' });
    const infoNa = view.label('11 p, 11 e⁻', [0, -3.05, 0], { size: 0.75, color: '#374151', fontSize: 52 });
    const infoCl = view.label('17 p, 17 e⁻', [0, -3.05, 0], { size: 0.75, color: '#374151', fontSize: 52 });
    const arrows = [view.arrow([-1.3, 2.4, 0], [-0.25, 2.4, 0], '#16a34a', { width: 0.07, head: 0.45 }), view.arrow([1.3, 2.4, 0], [0.25, 2.4, 0], '#16a34a', { width: 0.07, head: 0.45 })];
    const attLbl = view.label('attract', [0, 3.0, 0], { size: 0.7, color: '#15803d' });
    arrows.forEach(a => { a.visible = false; });
    const cap = overlay(view, '', 'left:0;right:0;top:4px;text-align:center;');
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;gap:8px"><button type="button" class="scene-btn" id="mol-transfer">Transfer electron</button><button type="button" class="scene-btn" id="mol-reset">Reset</button></div>');
    let mode = 'idle', t0 = 0, lastT = 0, lastCap = '';
    row.querySelector('#mol-transfer').addEventListener('click', () => { if (mode === 'idle') { mode = 'go'; t0 = lastT; } });
    row.querySelector('#mol-reset').addEventListener('click', () => { mode = 'idle'; });
    const pFrom = V3(0, 0, 0), pTo = V3(0, 0, 0), tmp = V3(0, 0, 0);
    const shellWorld = (atom, s, ang, out) => { out.set(radii[s] * Math.cos(ang), radii[s] * Math.sin(ang), 0); atom.shells[s].sg.localToWorld(out); return out; };
    view.run((t, dt) => {
      lastT = t;
      const q = mode === 'idle' ? 0 : ease((t - t0) / 1.6);
      const dd = mode === 'idle' ? 0 : ease((t - t0 - 1.6) / 1.2);
      const xN = -3.7 + 1.1 * dd, xC = 3.7 - 1.1 * dd;
      na.g.position.set(xN, 0, 0); cl.g.position.set(xC, 0, 0);
      const pulse = 1 + 0.07 * Math.sin(t * 4);
      na.nuc.scale.setScalar(0.42 * pulse); cl.nuc.scale.setScalar(0.42 * pulse);
      [na, cl].forEach(a => a.dots.forEach(d => { if (d !== mover) { const r = radii[d.s], an = angle(d, t); d.e.position.set(r * Math.cos(an), r * Math.sin(an), 0); } }));
      view.scene.updateMatrixWorld(true);
      shellWorld(na, 2, angle(mover, t), pFrom);
      shellWorld(cl, 2, angle({ s: 2, k: 0, slots: 8 }, t), pTo);
      mover.e.position.copy(pFrom).lerp(pTo, q); mover.e.position.y += Math.sin(Math.PI * q) * 1.4;
      const done = q >= 1;
      na.shells[2].ring.visible = !done;
      nameNa.position.set(xN, -2.45, 0); nameCl.position.set(xC, -2.45, 0);
      infoNa.position.set(xN, -3.05, 0); infoCl.position.set(xC, -3.05, 0);
      const setL = (sp, s) => { if (sp.userData.txt !== s) { sp.userData.txt = s; sp.userData.setText(s); } };
      setL(nameNa, done ? 'Na⁺' : 'Na'); setL(nameCl, done ? 'Cl⁻' : 'Cl');
      setL(infoNa, done ? '11 p, 10 e⁻' : '11 p, 11 e⁻'); setL(infoCl, done ? '17 p, 18 e⁻' : '17 p, 17 e⁻');
      arrows.forEach(a => { a.visible = dd > 0.05; });
      attLbl.visible = dd > 0.3;
      const txt = mode === 'idle' ? 'Na has 1 outer electron. Cl has 7 and needs 8.' : !done ? 'Na transfers its outer electron to Cl...' : '<span style="color:#15803d">Na⁺ and Cl⁻ attract: an ionic bond!</span>';
      if (txt !== lastCap) { cap.innerHTML = txt; lastCap = txt; }
    });
  });

  // ================================================================ STEP 4: reading a chemical formula
  const scene4 = Chem3D.define({ distance: 8.4, pitch: 0.4, yaw: 0.5, autoRotate: 0.28, target: [0, 0.35, 0] }, (view, ctx) => {
    const list = [
      { id: 'h2o', f: 'H₂O', rows: [['H', 2], ['O', 1]], k: 1.25 },
      { id: 'co2', f: 'CO₂', rows: [['C', 1], ['O', 2]], k: 1.15 },
      { id: 'ch4', f: 'CH₄', rows: [['C', 1], ['H', 4]], k: 1.25 },
      { id: 'glu', f: 'C₆H₁₂O₆', rows: [['C', 6], ['H', 12], ['O', 6]], k: 0.72 }
    ];
    list.forEach(m => {
      m.mol = buildMolecule(view, SPECS[m.id]);
      m.mol.group.scale.setScalar(m.k);
      m.mol.group.visible = false;
      let idx = 0;
      m.rows.forEach(([sym]) => m.mol.atoms.forEach(a => { if (a.userData.sym === sym) a.userData.order = idx++; }));
      m.total = idx;
    });
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;gap:6px;padding:2px 6px">' +
      list.map(m => `<button type="button" class="scene-btn" id="mol-f-${m.id}" style="padding:4px 9px">${m.f}</button>`).join('') + '</div>');
    const panel = overlay(view, '', 'left:8px;right:8px;top:4px;');
    let cur = null, start = 0, lastT = 0, lastHtml = '';
    function choose(m) {
      if (cur) cur.mol.group.visible = false;
      cur = m; start = lastT;
      m.mol.atoms.forEach(a => { a.userData.pop = 0; });
      m.mol.group.visible = true;
      setBtnOn(row, 'mol-f-' + m.id);
    }
    list.forEach(m => row.querySelector('#mol-f-' + m.id).addEventListener('click', () => choose(m)));
    choose(list[0]);
    const chip = (sym, n) => `<span style="display:inline-flex;align-items:center;gap:3px;margin-right:9px;white-space:nowrap"><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${view.color(sym)};border:1px solid #475569"></i>${sym}${n ? ' = ' + n : ''}</span>`;
    view.run((t, dt) => {
      lastT = t;
      const shown = cur.rows.map(() => 0);
      cur.mol.atoms.forEach(a => {
        const u = a.userData, p = ease((t - start - 0.05 - u.order * 0.13) / 0.3);
        u.pop = p * (1 + 0.25 * Math.sin(Math.PI * Math.min(1, (t - start - 0.05 - u.order * 0.13) / 0.3)) * (p < 1 ? 1 : 0));
        if (p >= 1) cur.rows.forEach(([sym], i) => { if (sym === u.sym) shown[i]++; });
      });
      cur.mol.tick(t, 0.03);
      const sum = shown.reduce((a, b) => a + b, 0);
      const html = `<div style="display:flex;align-items:baseline;gap:4px 10px;flex-wrap:wrap"><span style="font-size:1.3rem;color:var(--primary);line-height:1.1">${cur.f}</span>` +
        `<span>${cur.rows.map(([sym], i) => chip(sym, shown[i])).join('')}</span></div>` +
        `<div style="color:var(--t-muted,#64748b);font-weight:600;font-size:0.7rem">${sum ? 'Total: ' + sum + ' atoms' + (sum === cur.total ? ' in one molecule' : '') : 'The small number counts the atom before it'}</div>`;
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; }
    });
  });

  // ================================================================ STEP 5: molecules have shapes (rotating 3D models)
  const scene5 = Chem3D.define({ distance: 7.9, pitch: 0.32, yaw: 0.4, autoRotate: 0.55, target: [0, 0.4, 0] }, (view, ctx) => {
    const models = [
      { id: 'h2o', f: 'H₂O', name: 'Water', shape: 'Bent: 104.5°', bonds: '2 single bonds', k: 1.3 },
      { id: 'co2', f: 'CO₂', name: 'Carbon dioxide', shape: 'Linear: 180°', bonds: '2 double bonds', k: 1.15 },
      { id: 'ch4', f: 'CH₄', name: 'Methane', shape: 'Tetrahedral: 109.5°', bonds: '4 single bonds', k: 1.3 },
      { id: 'o2', f: 'O₂', name: 'Oxygen gas', shape: 'Two O atoms', bonds: '1 double bond', k: 1.5 }
    ];
    models.forEach(m => {
      m.mol = buildMolecule(view, SPECS[m.id]);
      m.mol.group.scale.setScalar(m.k);
      m.mol.group.visible = false;
    });
    // methane: translucent tetrahedron joining the four hydrogens
    const ch4 = models[2].mol, hs = ch4.atoms.slice(1).map(a => a.userData.base);
    const tg = new THREE.BufferGeometry();
    const pts = [];
    [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].forEach(f => f.forEach(i => pts.push(hs[i].x, hs[i].y, hs[i].z)));
    tg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    tg.computeVertexNormals();
    const hull = new THREE.Mesh(tg, view.mat('#818cf8', { opacity: 0.2, doubleSide: true, shininess: 10 }));
    ch4.group.add(hull);
    const eg = new THREE.EdgesGeometry(tg);
    const edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: '#4f46e5', transparent: true, opacity: 0.7 }));
    ch4.group.add(edges);
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;gap:6px;padding:2px 6px">' +
      models.map(m => `<button type="button" class="scene-btn" id="mol-m-${m.id}" style="padding:4px 10px">${m.f}</button>`).join('') + '</div>');
    const panel = overlay(view, '', 'left:8px;top:6px;max-width:44%;');
    let cur = null, start = 0, lastT = 0;
    function choose(m) {
      if (cur) cur.mol.group.visible = false;
      cur = m; start = lastT;
      m.mol.group.visible = true;
      panel.innerHTML = `<div style="font-size:1.7rem;line-height:1;color:var(--primary)">${m.f}</div><div>${m.name}</div>` +
        `<div style="color:var(--t-orange,#c2410c)">${m.shape}</div><div style="color:var(--t-muted,#64748b);font-weight:600">${m.bonds}</div>`;
      setBtnOn(row, 'mol-m-' + m.id);
    }
    models.forEach(m => row.querySelector('#mol-m-' + m.id).addEventListener('click', () => choose(m)));
    choose(models[0]);
    view.run((t, dt) => {
      lastT = t;
      const p = ease((t - start) / 0.5);
      cur.mol.atoms.forEach(a => { a.userData.pop = p; });
      cur.mol.group.rotation.y = 0.35 * Math.sin(t * 0.5);
      cur.mol.tick(t, 0.03);
    });
  });

  // ================================================================ STEP 6 (example): why ice floats
  const scene6 = Chem3D.define({ distance: 10.4, pitch: 0.42, yaw: 0.5, autoRotate: 0.2, target: [0, 2.15, 0] }, (view, ctx) => {
    const S = 1.05, BR = 2.7, BH = 5.2, Y0 = 0.45, RL = 2.3, H_ICE = 4.5, H_LIQ = 4.5 * 0.72;
    // ---- real ice Ih oxygen lattice (wurtzite-like, hexagonal channels along the vertical axis), nearest-neighbour distance 1
    const a = Math.sqrt(8 / 3), c = a * 1.633, basis = [[0, 0, 0], [0, 0, 3 / 8], [1 / 3, 1 / 3, 1 / 2], [1 / 3, 1 / 3, 7 / 8]];
    const all = [];
    for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) for (let k = -2; k <= 3; k++) basis.forEach(b => {
      const fx = i + b[0], fy = j + b[1], fz = k + b[2];
      all.push(V3(fx * a + fy * a / 2, fz * c, fy * a * 0.8660254));
    });
    const sel = all.filter(p => Math.hypot(p.x, p.z) < 2.0 && p.y >= -0.01 && p.y < 3.4);
    const near = (p, q) => Math.abs(p.distanceTo(q) - 1) < 0.03;
    const N = sel.length;
    // ---- glass beaker
    const beaker = view.beaker(BR, BH, { level: 0.9, liquidColor: '#cfe8ff', liquidOpacity: 0.28 });
    // ---- molecules
    const sph = cache(view, 'sph', () => new THREE.SphereGeometry(1, 20, 14));
    const mO = matOf(view, view.color('O')), mH = matOf(view, '#f1f5f9');
    const hA = V3(Math.sin(52.25 * Math.PI / 180), -Math.cos(52.25 * Math.PI / 180), 0), hB = V3(-hA.x, hA.y, 0);
    const Mloc = new THREE.Matrix4().makeBasis(V3(0, -1, 0), V3(-1, 0, 0), V3(0, 0, -1)).invert();
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const mols = sel.map((p0, i) => {
      const g = new THREE.Group(); view.scene.add(g);
      const o = new THREE.Mesh(sph, mO); o.scale.setScalar(0.27);
      const h1 = new THREE.Mesh(sph, mH); h1.scale.setScalar(0.16); h1.position.copy(hA).multiplyScalar(0.4);
      const h2 = new THREE.Mesh(sph, mH); h2.scale.setScalar(0.16); h2.position.copy(hB).multiplyScalar(0.4);
      g.add(o, h1, h2);
      const dirs = all.filter(q => near(p0, q)).map(q => q.clone().sub(p0).normalize());
      const ia = Math.floor(rnd() * dirs.length); let ib = Math.floor(rnd() * dirs.length); if (ib === ia) ib = (ia + 1) % dirs.length;
      const u = dirs[ia].clone().add(dirs[ib]).normalize(), w = dirs[ia].clone().cross(dirs[ib]).normalize(), v = w.clone().cross(u);
      const R = new THREE.Matrix4().makeBasis(u, v, w).multiply(Mloc);
      const target = new THREE.Quaternion().setFromRotationMatrix(R);
      const site = V3(p0.x * S, p0.y * S + Y0, p0.z * S);
      g.position.copy(site);
      g.quaternion.copy(target);
      return { g, site, target, pos: site.clone(), vel: V3(0, 0, 0), axis: V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), spin: 1 + rnd() * 2.2, ph: i * 1.7 };
    });
    // ---- hydrogen bonds (thin blue rods between neighbouring molecules), visible only in ice
    const bmat = view.mat('#38bdf8', { opacity: 0.7, shininess: 20 });
    const links = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (near(sel[i], sel[j])) {
      const m = new THREE.Mesh(cylGeo(view), bmat); view.scene.add(m); links.push([i, j, m]);
    }
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:38%;font-size:0.7rem;');
    const row = ctx.controls('<div class="scene-slider-row" style="padding:2px 10px"><span>Temp</span><input type="range" id="mol3d-temp" min="-10" max="20" step="1" value="-6" aria-label="Water temperature"><span id="mol3d-tv" style="min-width:52px;text-align:right">-6 °C</span></div>');
    const slider = row.querySelector('#mol3d-temp'), tv = row.querySelector('#mol3d-tv');
    let lastHtml = '';
    function labels() {
      const t = +slider.value, ice = t <= 0;
      tv.textContent = t + ' °C';
      const html = `<div style="font-size:1.25rem;line-height:1.1;color:var(--t-ink)">${t} °C</div><div style="color:var(--primary)">${t < 0 ? 'Solid ice' : t === 0 ? 'Freezing point' : 'Liquid water'}</div>` +
        `<div style="font-weight:600">${ice ? 'Open hexagon pattern with gaps.' : 'Tumbling, packed closer.'}</div><div style="color:var(--t-orange,#c2410c)">${ice ? 'Less dense: it floats!' : 'More dense than ice.'}</div>`;
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; }
    }
    slider.addEventListener('input', labels);
    labels();
    let f = 1, wasIce = true;
    const ice0 = new THREE.Color('#dbeafe'), liq0 = new THREE.Color('#7dd3fc'), tmpC = new THREE.Color();
    const up = V3(0, 1, 0), d = V3(0, 0, 0), dq = new THREE.Quaternion();
    view.run((t, dt) => {
      dt = Math.min(dt, 0.05);
      const ice = +slider.value <= 0;
      if (wasIce && !ice) mols.forEach(m => { m.vel.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2.4); });
      wasIce = ice;
      f += ((ice ? 1 : 0) - f) * Math.min(1, dt * 2.5);
      const hNow = mix(H_LIQ, H_ICE, f);
      beaker.setLevel(hNow / (BH * 0.96));
      beaker.liquidMesh.material.color.copy(tmpC.copy(liq0).lerp(ice0, f));
      const top = hNow;
      mols.forEach(m => {
        if (ice) {
          const jx = 0.035 * Math.sin(t * 7 + m.ph), jy = 0.035 * Math.cos(t * 6 + m.ph * 1.3), jz = 0.035 * Math.sin(t * 5.3 + m.ph * 0.7);
          const k = Math.min(1, dt * 5);
          m.pos.x += (m.site.x + jx - m.pos.x) * k; m.pos.y += (m.site.y + jy - m.pos.y) * k; m.pos.z += (m.site.z + jz - m.pos.z) * k;
          m.g.quaternion.slerp(m.target, Math.min(1, dt * 3));
        } else {
          m.vel.x += (rnd() - 0.5) * 9 * dt; m.vel.y += (rnd() - 0.5) * 9 * dt; m.vel.z += (rnd() - 0.5) * 9 * dt;
          const sp = m.vel.length(); if (sp > 1.5) m.vel.multiplyScalar(1.5 / sp);
          m.pos.addScaledVector(m.vel, dt);
          const rr = Math.hypot(m.pos.x, m.pos.z);
          if (rr > RL) { const nx = m.pos.x / rr, nz = m.pos.z / rr; m.pos.x = nx * RL; m.pos.z = nz * RL; const vr = m.vel.x * nx + m.vel.z * nz; if (vr > 0) { m.vel.x -= 2 * vr * nx; m.vel.z -= 2 * vr * nz; } }
          if (m.pos.y < 0.4) { m.pos.y = 0.4; m.vel.y = Math.abs(m.vel.y); }
          const hi = top - 0.35;
          if (m.pos.y > hi) { m.pos.y += (hi - m.pos.y) * Math.min(1, dt * 6); if (m.vel.y > 0) m.vel.y = -m.vel.y * 0.5; }
          dq.setFromAxisAngle(m.axis, m.spin * dt);
          m.g.quaternion.multiply(dq);
        }
      });
      if (!ice) for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const A = mols[i].pos, B = mols[j].pos;
        d.copy(B).sub(A); const dist = d.length();
        if (dist > 0.001 && dist < 0.85) { d.multiplyScalar((0.85 - dist) / 2 / dist); A.sub(d); B.add(d); }
      }
      mols.forEach(m => m.g.position.copy(m.pos));
      bmat.opacity = 0.75 * f * f;
      links.forEach(([i, j, m]) => {
        m.visible = f > 0.03;
        if (!m.visible) return;
        const A = mols[i].pos, B = mols[j].pos;
        d.copy(B).sub(A); const len = d.length();
        m.position.copy(A).add(B).multiplyScalar(0.5);
        m.scale.set(0.03, len, 0.03);
        m.quaternion.setFromUnitVectors(up, d.multiplyScalar(1 / Math.max(len, 1e-4)));
      });
    });
  });

  // ================================================================ STEP 7 (example): breathing gases
  const scene7 = Chem3D.define({ distance: 11.4, pitch: 0.22, yaw: 0.25, autoRotate: 0, target: [0, -0.6, 0] }, (view, ctx) => {
    const pink = view.mat('#fbcfe8', { opacity: 0.93, shininess: 60 }), dark = view.mat('#db2777', { shininess: 40 });
    const lungs = new THREE.Group(); view.scene.add(lungs);
    const lobeGeo = new THREE.SphereGeometry(1, 32, 24);
    [-1, 1].forEach(sg => {
      const lobe = new THREE.Mesh(lobeGeo, pink);
      lobe.scale.set(0.95, 1.55, 0.85); lobe.position.set(sg * 1.05, -0.35, 0); lungs.add(lobe);
      const bronchus = view.cylinder([0, 0.75, 0], [sg * 0.85, 0.15, 0], 0.13, '#db2777');
      lungs.add(bronchus);
    });
    const trachea = view.cylinder([0, 2.3, 0], [0, 0.7, 0], 0.2, '#db2777');
    lungs.add(trachea);
    void dark;
    const lungLbl = view.label('Lungs', [0, -0.3, 0.9], { size: 0.8, color: '#9d174d' });
    view.label('Breathe in →', [-3.9, 2.05, 0], { size: 0.7, color: '#1d4ed8' });
    view.label('Breathe out →', [3.9, 2.05, 0], { size: 0.7, color: '#c2410c' });
    overlay(view, '<span style="color:#dc2626">O₂</span> = 2 oxygen atoms<br><span style="color:#374151">CO₂</span> = 1 carbon + 2 oxygen atoms', 'left:0;right:0;top:3px;text-align:center;font-size:0.7rem;');
    const ys = [-1.5, 0.05, 1.25, -0.8, 0.7, -0.3], zs = [0.9, -0.9, 0.2, -0.5, 0.7, -1.3];
    const mk = (spec, k, i) => { const m = buildMolecule(view, spec); m.tick(0, 0); m.k = k; m.i = i; return m; };
    const o2s = ys.map((y, i) => mk(SPECS.o2, 0.7, i));
    const co2s = ys.map((y, i) => mk(SPECS.co2, 0.6, i));
    const sway7 = sway(view, 0.28, 0.35);
    view.run((t, dt) => {
      sway7(t);
      const br = 1 + 0.07 * Math.sin(t * Math.PI / 2);
      lungs.scale.set(br, br, br);
      lungLbl.position.set(0, -0.3, 0.9 * br + 0.2);
      o2s.forEach((m, i) => {
        const u = ((t + i * 0.67) % 4) / 4;
        const s = ease(u / 0.18) * (1 - ease((u - 0.8) / 0.2));
        m.group.position.set(mix(-5.1, -2.3, u), ys[i], zs[i]);
        m.group.scale.setScalar(Math.max(0.001, m.k * s));
        m.group.rotation.set(t * 0.8 + i, t * 0.55 + i * 2, 0.3 * i);
      });
      co2s.forEach((m, i) => {
        const u = ((t + 0.33 + i * 0.67) % 4) / 4;
        const s = ease(u / 0.2) * (1 - ease((u - 0.82) / 0.18));
        m.group.position.set(mix(2.3, 5.1, u), ys[(i + 3) % 6], zs[(i + 2) % 6]);
        m.group.scale.setScalar(Math.max(0.001, m.k * s));
        m.group.rotation.set(t * 0.5 + i * 1.3, t * 0.7 + i, 0.4 * i);
      });
    });
  });

  // ================================================================ STEP 8 (example): salt vs sugar dissolving
  const scene8 = Chem3D.define({ distance: 9.2, pitch: 0.4, yaw: 0.5, autoRotate: 0.18, target: [0, 2.0, 0] }, (view, ctx) => {
    const BR = 2.5, BH = 4.4, LEVEL = 0.78, RL = 2.15, NW = 22, NP = 12, SP = 0.95;
    const beaker = view.beaker(BR, BH, { level: LEVEL, liquidColor: '#93c5fd', liquidOpacity: 0.26 });
    const top = BH * 0.96 * LEVEL;
    const sph = cache(view, 'sph', () => new THREE.SphereGeometry(1, 20, 14));
    const hexG = cache(view, 'hex', () => new THREE.CylinderGeometry(0.42, 0.42, 0.34, 6));
    const mO = matOf(view, view.color('O')), mH = matOf(view, '#f1f5f9');
    const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const hA = V3(Math.sin(52.25 * Math.PI / 180), -Math.cos(52.25 * Math.PI / 180), 0), hB = V3(-hA.x, hA.y, 0);
    const rndVec = k => V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(k);
    const rndAxis = () => rndVec(1).normalize();
    const inside = (v, yLo, yHi) => { v.y = Math.min(yHi, Math.max(yLo, v.y)); const rr = Math.hypot(v.x, v.z); if (rr > RL) { v.x *= RL / rr; v.z *= RL / rr; } };
    // water molecules tumbling in the beaker
    const waters = [];
    for (let i = 0; i < NW; i++) {
      const g = new THREE.Group(); view.scene.add(g);
      const o = new THREE.Mesh(sph, mO); o.scale.setScalar(0.27);
      const h1 = new THREE.Mesh(sph, mH); h1.scale.setScalar(0.16); h1.position.copy(hA).multiplyScalar(0.4);
      const h2 = new THREE.Mesh(sph, mH); h2.scale.setScalar(0.16); h2.position.copy(hB).multiplyScalar(0.4);
      g.add(o, h1, h2);
      const pos = V3((rnd() - 0.5) * 4, 0.4 + rnd() * (top - 0.9), (rnd() - 0.5) * 4); inside(pos, 0.4, top - 0.4);
      waters.push({ g, pos, vel: rndVec(1.4), axis: rndAxis(), spin: 1 + rnd() * 2 });
    }
    // solid pieces: salt (Na+ / Cl- checkerboard cube) and sugar (whole hexagonal molecules), 2 x 3 x 2 block
    const cells = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 2; k++) cells.push({ i, j, k });
    const mkSolid = kind => cells.map(c => {
      const g = new THREE.Group(); view.scene.add(g);
      if (kind === 'salt') {
        const cl = (c.i + c.j + c.k) % 2 === 1;
        const m = new THREE.Mesh(sph, matOf(view, cl ? view.color('Cl') : view.color('Na')));
        m.scale.setScalar(cl ? 0.5 : 0.34); g.add(m);
      } else {
        const m = new THREE.Mesh(hexG, matOf(view, '#f5b301')); g.add(m);
        const dot = new THREE.Mesh(sph, matOf(view, '#b45309')); dot.scale.setScalar(0.14); dot.position.y = 0.19; g.add(dot);
      }
      const home = V3((c.i - 0.5) * SP, 0.5 + c.j * SP, (c.k - 0.5) * SP);
      return { g, home, pos: home.clone(), vel: V3(0, 0, 0), axis: rndAxis(), spin: 0.8 + rnd(), free: false, order: c.j * 10 + rnd() };
    });
    const solids = { salt: mkSolid('salt'), sugar: mkSolid('sugar') };
    const info = {
      salt: ['Salt in water', 'Water pulls the ions apart; each floats free.', ' ions free',
        '<i style="background:#8b5cf6"></i>Na⁺ <i style="background:#22c55e"></i>Cl⁻ <i style="background:#ef4444"></i>water'],
      sugar: ['Sugar in water', 'Whole molecules break away in one piece.', ' molecules free',
        '<i style="background:#f5b301"></i>sugar molecule <i style="background:#ef4444"></i>water']
    };
    const panel = overlay(view, '', 'left:8px;top:5px;max-width:38%;font-size:0.7rem;');
    const row = ctx.controls('<div class="scene-slider-row" style="justify-content:center;gap:8px;padding:2px 6px"><button type="button" class="scene-btn" id="mol3d-salt">Salt</button><button type="button" class="scene-btn" id="mol3d-sugar">Sugar</button><button type="button" class="scene-btn" id="mol3d-again">Restart</button></div>');
    let mode = 'salt', free = 0, nextAt = 0, doneAt = 0, lastT = 0, lastHtml = '';
    function build() {
      ['salt', 'sugar'].forEach(kd => solids[kd].forEach(p => { p.g.visible = kd === mode; p.free = false; p.pos.copy(p.home); p.vel.set(0, 0, 0); p.g.quaternion.identity(); }));
      solids[mode].slice().sort((a, b) => b.order - a.order).forEach((p, i) => { p.k = i; });
      free = 0; nextAt = lastT + 0.9; doneAt = 0;
      setBtnOn(row, 'mol3d-' + mode);
    }
    row.querySelector('#mol3d-salt').addEventListener('click', () => { mode = 'salt'; build(); });
    row.querySelector('#mol3d-sugar').addEventListener('click', () => { mode = 'sugar'; build(); });
    row.querySelector('#mol3d-again').addEventListener('click', build);
    build();
    const d = V3(0, 0, 0), dq = new THREE.Quaternion();
    const tumble = (m, dt) => { dq.setFromAxisAngle(m.axis, m.spin * dt); m.g.quaternion.multiply(dq); };
    const wander = (m, dt, sp) => {
      m.vel.add(rndVec(9 * dt)); const s = m.vel.length(); if (s > sp) m.vel.multiplyScalar(sp / s);
      m.pos.addScaledVector(m.vel, dt);
      const rr = Math.hypot(m.pos.x, m.pos.z);
      if (rr > RL) { const nx = m.pos.x / rr, nz = m.pos.z / rr, vr = m.vel.x * nx + m.vel.z * nz; if (vr > 0) { m.vel.x -= 2 * vr * nx; m.vel.z -= 2 * vr * nz; } }
      if (m.pos.y < 0.4 && m.vel.y < 0) m.vel.y = -m.vel.y;
      if (m.pos.y > top - 0.4 && m.vel.y > 0) m.vel.y = -m.vel.y;
      inside(m.pos, 0.4, top - 0.4);
    };
    view.run((t, dt) => {
      dt = Math.min(dt, 0.05); lastT = t;
      const cur = solids[mode];
      if (free < NP && t >= nextAt) {
        const p = cur.find(q => q.k === free); p.free = true; p.vel.copy(rndVec(1.6)); p.vel.y += 0.5; free++; nextAt = t + 0.9;
      }
      if (free === NP) { if (!doneAt) doneAt = t; else if (t - doneAt > 4.5) build(); }
      cur.forEach(p => { if (p.free) { wander(p, dt, mode === 'salt' ? 1.1 : 0.9); tumble(p, dt); } p.g.position.copy(p.pos); });
      // free pieces keep apart from each other and from the crystal that is still there
      for (let i = 0; i < NP; i++) {
        const A = cur[i];
        for (let j = i + 1; j < NP; j++) {
          const B = cur[j];
          if (!A.free && !B.free) continue;
          d.copy(B.pos).sub(A.pos); const dist = d.length();
          if (dist > 0.001 && dist < 0.8) { d.multiplyScalar((0.8 - dist) / dist / (A.free && B.free ? 2 : 1)); if (A.free) A.pos.sub(d.clone().multiplyScalar(B.free ? 1 : 2)); if (B.free) B.pos.add(d.clone().multiplyScalar(A.free ? 1 : 2)); }
        }
      }
      waters.forEach(w => {
        wander(w, dt, 1.3); tumble(w, dt);
        cur.forEach(p => { d.copy(w.pos).sub(p.pos); const dist = d.length(); if (dist > 0.001 && dist < 0.75) w.pos.addScaledVector(d, (0.75 - dist) / dist * 0.5); });
        w.g.position.copy(w.pos);
      });
      const html = `<div style="font-size:0.95rem;color:var(--primary)">${info[mode][0]}</div><div style="font-weight:600">${info[mode][1]}</div>` +
        `<div style="color:var(--t-orange,#c2410c)">${free}/${NP}${info[mode][2]}</div><div class="mol3d-key" style="font-weight:600;font-size:0.68rem">${info[mode][3]}</div>`;
      if (html !== lastHtml) { panel.innerHTML = html; lastHtml = html; panel.querySelectorAll('.mol3d-key i').forEach(e => { e.style.cssText += ';display:inline-block;width:9px;height:9px;border-radius:50%;margin:0 3px 0 6px;vertical-align:middle;border:1px solid #475569'; }); }
    });
  });

  // @@SCENES
  // ================================================================ explain / say re-issued for the 3D scenes
  addTutorialExplanations('chemistry', 'molecules', [
      {
          "explain": "<p>Two <b>hydrogen atoms</b> (H), each a small <b>red nucleus</b> inside a soft <b>cloud sphere</b> with one <b>indigo electron</b> circling it, glide together. When the clouds overlap, both electrons loop around <b>both</b> nuclei, and the label reads <b>H<sub>2</sub> molecule</b>. Then the atoms drift apart and it repeats.</p><p>Notice that the electrons are shared, not given away.</p>",
          "say": "This picture is in three dimensions, so you can drag it to turn it around. Look at the two round clouds. Each one is a hydrogen atom, with a red nucleus in the middle and one blue electron circling it. A hydrogen atom has just one electron, but its shell is happiest with two. Watch what happens as the atoms slide together. The clouds overlap, and the electrons start moving around both nuclei. Now the atoms share a pair of electrons, so each one can count two. That sharing is called a covalent bond, and the joined atoms form a hydrogen molecule."
      },
      {
          "explain": "<p>A 3D ball-and-stick model of <b>water</b>: one big <b>red oxygen</b> ball and two smaller <b>white hydrogen</b> balls joined by <b>grey sticks</b> (bonds). The hydrogens sway gently. The dashed <b>orange arc</b> marks the angle, about <b>104.5°</b>. Drag to look from other sides.</p><p>Notice that the molecule is bent, not a straight line.</p>",
          "say": "This is a model of a water molecule. The big red ball is one oxygen atom. The two smaller white balls are hydrogen atoms, and the grey sticks between them are the bonds, where electrons are shared. Look at the shape. It is not a straight line. The two hydrogens sway a little, and the dashed orange arc shows the angle between them, about one hundred and four point five degrees. So water is bent. Now read the formula in the corner. It says H 2 O. The small two means two hydrogen atoms, and no number after the O means one oxygen atom."
      },
      {
          "explain": "<p>A <b>sodium</b> atom and a <b>chlorine</b> atom each have three tilted rings of <b>indigo electrons</b>. Press <b>Transfer electron</b>: sodium's single <b>orange</b> outer electron flies across to chlorine, the atoms slide closer, and the labels change to <b>Na<sup>+</sup></b> and <b>Cl<sup>−</sup></b>. Green arrows and the word <b>attract</b> appear. <b>Reset</b> starts again.</p>",
          "say": "Now for a different kind of bond. Look at sodium and chlorine. The caption says sodium has one outer electron, shown in orange, while chlorine has seven and needs eight. Press the transfer electron button and watch. The orange electron flies across to chlorine. Sodium lost an electron, so it becomes a sodium ion with a plus one charge. Chlorine gained one, so it becomes a chloride ion with a minus one charge. The two atoms slide together, and green arrows show that opposite charges attract. This is an ionic bond. Here the electron was transferred, not shared. Press reset to watch again."
      },
      {
          "explain": "<p>Pick a molecule: <b>H<sub>2</sub>O</b>, <b>CO<sub>2</sub></b>, <b>CH<sub>4</sub></b> or <b>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></b>. The real 3D molecule builds itself, one atom popping in at a time (H white, O red, C dark grey). Counters at the top show how many of each atom so far, and a total.</p><p>Notice that each small number matches its counter.</p>",
          "say": "This scene teaches you to read a chemical formula. It starts with water, H 2 O. Watch the real molecule build itself, one atom at a time. The letter H gets two white balls, because the small two counts the hydrogen atoms. The letter O gets just one red ball, because when there is no number, it means one. The counters at the top add up the total number of atoms in one molecule. Now press the carbon dioxide button. You should see one dark ball for carbon and two red balls for oxygen. Try methane and glucose too, and check that every small number matches its counter."
      },
      {
          "explain": "<p>A rotating <b>ball-and-stick model</b>: <b>red</b> oxygen, <b>dark grey</b> carbon, <b>white</b> hydrogen, and <b>grey sticks</b> for bonds (double bonds are two sticks). Choose H<sub>2</sub>O, CO<sub>2</sub>, CH<sub>4</sub> or O<sub>2</sub>; the panel names it and gives its shape and bond type. Methane shows a faint <b>tetrahedron</b>.</p><p>Notice that shapes are 3D.</p>",
          "say": "Here you can spin molecules in three dimensions. The red balls are oxygen atoms, the dark grey ball is carbon, and the smaller white balls are hydrogen. The grey sticks are bonds. Where you see two parallel sticks, that is a double bond. The model starts with water. Look at how it is bent. Now press the carbon dioxide button. It is a straight line, with a double bond on each side. Try methane. Its four hydrogens point to the corners of a shape called a tetrahedron. The last button shows oxygen gas, just two oxygen atoms joined by a double bond. Read the panel in the corner to see each name and shape."
      },
      {
          "explain": "<p>A glass <b>beaker</b> holds <b>water molecules</b>: a <b>red oxygen</b> ball with two small <b>white hydrogens</b>. At 0 °C or below they lock into an open 3D pattern joined by thin <b>blue lines</b>, with gaps between, and the water level is high. Slide above 0 °C and they tumble and pack closer, so the level drops.</p><p>Notice that ice takes up more room, so it is less dense.</p>",
          "say": "Look at the beaker. Each little shape is a water molecule, a red oxygen with two small white hydrogens. The slider starts at minus six degrees Celsius, so this is ice. The molecules are locked in an open pattern, joined by thin blue lines, with empty gaps between them. Now drag the temperature slider above zero degrees Celsius. The molecules break out of the pattern, tumble around, and pack closer together. Watch the water level drop. Liquid water takes up less space than the same water as ice. That means ice is less dense than liquid water, so ice floats. The picture exaggerates the gaps to make them easy to see."
      },
      null,
      {
          "explain": "<p>Choose <b>Salt</b> or <b>Sugar</b>. Salt is a block of small <b>purple</b> Na<sup>+</sup> ions and larger <b>green</b> Cl<sup>−</sup> ions; sugar is a block of <b>yellow hexagon</b> molecules. Red-and-white water molecules tumble around, and every second another piece breaks away. A counter shows how many are free. <b>Restart</b> repeats.</p><p>Notice that salt splits into separate ions, but sugar molecules stay whole.</p>",
          "say": "Look at the pile at the bottom of the beaker. It starts as salt. The small purple balls are sodium ions, and the larger green balls are chloride ions. Small red and white water molecules tumble around them. Watch one piece break away every second. Each ion floats off by itself. The counter shows how many are free. Salt is ionic, so water pulls it apart into separate ions. Now press the sugar button. The yellow hexagons are whole sugar molecules. They also break away and spread out, but each one stays in one piece. Both seem to vanish, but for different reasons."
      }
  ]);
  // @@ATTACH
  addTutorialScenes3D('chemistry', 'molecules', [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8]);
})();
