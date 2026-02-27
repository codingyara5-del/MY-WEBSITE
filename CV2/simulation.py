#!/usr/bin/env python3
"""
ADVANCED CHEMISTRY SIMULATION MODULE
Baking Soda & Vinegar Acid-Base Reaction
====================================

This optional module provides advanced chemistry simulations,
molecular calculations, and particle physics for the interactive
educational science experiment.

Use: python simulation.py
"""

import math
import json
from dataclasses import dataclass
from typing import List, Dict, Tuple

# ========== CHEMICAL CONSTANTS ==========
MOLAR_MASS = {
    'NaHCO3': 84.007,      # Sodium Bicarbonate (Baking Soda)
    'CH3COOH': 60.052,     # Acetic Acid (Vinegar)
    'H2O': 18.015,         # Water
    'CO2': 44.009,         # Carbon Dioxide
    'CH3COONa': 82.034,    # Sodium Acetate
}

AVOGADRO = 6.022e23  # Particles per mole


# ========== DATA CLASSES ==========
@dataclass
class Substance:
    """Represents a chemical substance"""
    name: str
    formula: str
    molar_mass: float
    amount_moles: float
    concentration: float = 0.0  # mol/L
    
    def mass_grams(self) -> float:
        """Calculate mass in grams"""
        return self.amount_moles * self.molar_mass
    
    def particle_count(self) -> float:
        """Calculate number of particles"""
        return self.amount_moles * AVOGADRO


@dataclass
class ReactionProduct:
    """Represents a product of chemical reaction"""
    name: str
    formula: str
    moles_produced: float
    physical_state: str  # solid, liquid, gas
    

# ========== CHEMISTRY CALCULATIONS ==========
class AcidBaseReaction:
    """
    Simulates the baking soda and vinegar acid-base reaction
    
    Balanced equation:
    NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑
    """
    
    def __init__(self, baking_soda_moles: float = 0.05, 
                 vinegar_concentration: float = 0.05, 
                 vinegar_volume_liters: float = 0.1):
        """
        Initialize reaction parameters
        
        Args:
            baking_soda_moles: Moles of NaHCO₃ (typical: 0.01-0.1)
            vinegar_concentration: Molarity of acetic acid (typical: 0.8-1.0 M)
            vinegar_volume_liters: Volume of vinegar in liters (typical: 0.05-0.2)
        """
        self.baking_soda = Substance(
            name='Baking Soda',
            formula='NaHCO₃',
            molar_mass=MOLAR_MASS['NaHCO3'],
            amount_moles=baking_soda_moles
        )
        
        acetic_acid_moles = vinegar_concentration * vinegar_volume_liters
        self.vinegar = Substance(
            name='Vinegar (Acetic Acid)',
            formula='CH₃COOH',
            molar_mass=MOLAR_MASS['CH3COOH'],
            amount_moles=acetic_acid_moles,
            concentration=vinegar_concentration
        )
        
        self.products: List[ReactionProduct] = []
        self.limiting_reagent: str = ''
        self.reaction_progress: float = 0.0  # 0-1
    
    def determine_limiting_reagent(self) -> Tuple[str, float]:
        """
        Determine which reactant is the limiting reagent
        From equation: 1 NaHCO₃ : 1 CH₃COOH (1:1 molar ratio)
        
        Returns:
            Tuple of (limiting_reagent_name, moles_of_reaction)
        """
        if self.baking_soda.amount_moles < self.vinegar.amount_moles:
            self.limiting_reagent = 'Baking Soda'
            reaction_moles = self.baking_soda.amount_moles
        else:
            self.limiting_reagent = 'Vinegar'
            reaction_moles = self.vinegar.amount_moles
        
        return self.limiting_reagent, reaction_moles
    
    def calculate_products(self) -> List[ReactionProduct]:
        """
        Calculate products based on balanced equation:
        NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑
        
        From 1 mole of reaction:
        - 1 mole CH₃COONa (sodium acetate - salt)
        - 1 mole H₂O (water)
        - 1 mole CO₂ (carbon dioxide gas)
        """
        limiting_reagent, reaction_moles = self.determine_limiting_reagent()
        
        self.products = [
            ReactionProduct(
                name='Sodium Acetate',
                formula='CH₃COONa',
                moles_produced=reaction_moles,
                physical_state='solute'
            ),
            ReactionProduct(
                name='Water',
                formula='H₂O',
                moles_produced=reaction_moles,
                physical_state='liquid'
            ),
            ReactionProduct(
                name='Carbon Dioxide',
                formula='CO₂',
                moles_produced=reaction_moles,
                physical_state='gas'
            )
        ]
        
        return self.products
    
    def calculate_gas_volume(self, temperature_kelvin: float = 298.15, 
                            pressure_atm: float = 1.0) -> float:
        """
        Calculate volume of CO₂ gas produced using ideal gas law
        PV = nRT
        
        Args:
            temperature_kelvin: Absolute temperature (default: 298K = 25°C)
            pressure_atm: Pressure in atmospheres (default: 1 atm)
        
        Returns:
            Volume in liters
        """
        R = 0.08206  # L·atm/(mol·K)
        
        co2_product = next(p for p in self.products if p.formula == 'CO₂')
        volume = (co2_product.moles_produced * R * temperature_kelvin) / pressure_atm
        
        return volume
    
    def calculate_bubble_count(self) -> float:
        """
        Estimate number of CO₂ bubbles
        Assumes typical bubble radius of 1.5mm
        
        Returns:
            Estimated number of bubbles
        """
        co2_product = next(p for p in self.products if p.formula == 'CO₂')
        volume_liters = self.calculate_gas_volume()
        volume_cm3 = volume_liters * 1000
        
        # Bubble volume assuming 1.5mm radius
        bubble_radius_cm = 0.15
        single_bubble_volume = (4/3) * math.pi * (bubble_radius_cm ** 3)
        
        bubble_count = int(volume_cm3 / single_bubble_volume)
        return bubble_count
    
    def estimate_reaction_time(self) -> float:
        """
        Estimate reaction completion time in seconds
        Based on surface area and reaction kinetics
        
        Returns:
            Time in seconds
        """
        # Typical reaction: 2-5 seconds for observable completion
        # Varies with concentration, temperature, stirring
        base_time = 3.0  # seconds
        
        # Temperature factor (Q10 = 2, every 10°C doubles rate)
        temperature_factor = 1.0  # Could be adjusted
        
        # Concentration factor
        concentration_factor = min(1.0, self.vinegar.concentration / 1.0)
        
        estimated_time = base_time / (temperature_factor * concentration_factor)
        return estimated_time


# ========== FOAM DYNAMICS ==========
class FoamDynamics:
    """Models foam expansion and decay"""
    
    def __init__(self, initial_co2_moles: float):
        """Initialize foam dynamics"""
        self.co2_moles = initial_co2_moles
        self.foam_volume_ml = 0.0
        self.max_foam_expansion = 0.0
    
    def calculate_max_foam(self, liquid_volume_ml: float = 100) -> float:
        """
        Calculate maximum foam volume
        Foam expands with CO₂ gas production
        
        Args:
            liquid_volume_ml: Initial liquid volume
        
        Returns:
            Maximum foam volume in ml
        """
        # Approximate: CO₂ at STP = 22.4 L/mol
        co2_volume_liters = (self.co2_moles * 22.4) / 1000
        co2_volume_ml = co2_volume_liters * 1000
        
        # Foam is mixture of liquid and gas
        # Typically 80-90% gas, 10-20% liquid in foam
        self.max_foam_expansion = co2_volume_ml * 2  # Conservative estimate
        
        return self.max_foam_expansion
    
    def foam_height_over_time(self, time_seconds: float, 
                              max_height_cm: float = 15) -> float:
        """
        Model foam height as function of time
        Uses logistic growth curve
        
        Args:
            time_seconds: Time since reaction start
            max_height_cm: Maximum foam height
        
        Returns:
            Current foam height in cm
        """
        # Logistic curve parameters
        midpoint_time = 1.5  # seconds
        growth_rate = 3.0
        
        height = max_height_cm / (1 + math.exp(-growth_rate * (time_seconds - midpoint_time)))
        
        return height


# ========== pH CALCULATION ==========
class pHCalculation:
    """Calculate pH during reaction"""
    
    @staticmethod
    def calculate_weak_acid_ph(concentration: float, ka: float = 1.8e-5) -> float:
        """
        Calculate pH of weak acid (acetic acid)
        
        Args:
            concentration: Molarity of acid
            ka: Acid dissociation constant for acetic acid
        
        Returns:
            pH value
        """
        h_ion_concentration = math.sqrt(ka * concentration)
        ph = -math.log10(h_ion_concentration)
        return ph
    
    @staticmethod
    def calculate_weak_base_ph(concentration: float, kb: float = 2.3e-8) -> float:
        """
        Calculate pH of weak base (sodium bicarbonate)
        
        Args:
            concentration: Molarity of base
            kb: Base dissociation constant
        
        Returns:
            pH value
        """
        poh = 0.5 * (math.log10(kb) - math.log10(concentration))
        ph = 14 - poh
        return ph
    
    @staticmethod
    def calculate_neutral_ph() -> float:
        """Calculate pH of neutral solution (water/salt)"""
        return 7.0


# ========== THERMODYNAMICS ==========
class ReactionThermodynamics:
    """Calculate heat released by reaction"""
    
    def __init__(self):
        # Standard enthalpies of formation (kJ/mol)
        self.delta_hf = {
            'NaHCO3': -947.7,
            'CH3COOH': -484.5,
            'H2O': -285.8,
            'CO2': -393.5,
            'CH3COONa': -708.6,
        }
    
    def calculate_reaction_enthalpy(self) -> float:
        """
        Calculate ΔH for: NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂
        
        Returns:
            Enthalpy change in kJ/mol
        """
        # ΔH_rxn = Σ(ΔH_f products) - Σ(ΔH_f reactants)
        products_enthalpy = (
            self.delta_hf['CH3COONa'] + 
            self.delta_hf['H2O'] + 
            self.delta_hf['CO2']
        )
        
        reactants_enthalpy = (
            self.delta_hf['NaHCO3'] + 
            self.delta_hf['CH3COOH']
        )
        
        delta_h = products_enthalpy - reactants_enthalpy
        return delta_h
    
    def calculate_heat_released(self, reaction_moles: float) -> float:
        """
        Calculate total heat released
        
        Args:
            reaction_moles: Moles of reaction occurring
        
        Returns:
            Heat in kilojoules
        """
        delta_h = self.calculate_reaction_enthalpy()
        heat = abs(delta_h * reaction_moles)
        return heat


# ========== MAIN SIMULATION ==========
class ExperimentSimulation:
    """Main simulation orchestrator"""
    
    def __init__(self, baking_soda_grams: float = 4.2, 
                 vinegar_ml: float = 100):
        """
        Initialize full experiment simulation
        
        Args:
            baking_soda_grams: Mass of baking soda in grams
            vinegar_ml: Volume of vinegar in ml
        """
        # Convert to moles
        bs_moles = baking_soda_grams / MOLAR_MASS['NaHCO3']
        v_moles = (vinegar_ml / 1000) * 0.05  # Assume ~5% acetic acid
        
        self.reaction = AcidBaseReaction(
            baking_soda_moles=bs_moles,
            vinegar_concentration=0.05,
            vinegar_volume_liters=vinegar_ml / 1000
        )
        
        self.reaction.calculate_products()
        self.thermo = ReactionThermodynamics()
        self.foam = FoamDynamics(
            self.reaction.products[2].moles_produced  # CO₂ moles
        )
    
    def run_simulation(self) -> Dict:
        """
        Run complete simulation and return results
        
        Returns:
            Dictionary with simulation results
        """
        limiting_reagent, reaction_moles = self.reaction.determine_limiting_reagent()
        
        results = {
            'reactants': {
                'baking_soda': {
                    'moles': self.reaction.baking_soda.amount_moles,
                    'mass_grams': self.reaction.baking_soda.mass_grams(),
                    'particles': self.reaction.baking_soda.particle_count()
                },
                'vinegar': {
                    'moles': self.reaction.vinegar.amount_moles,
                    'concentration': self.reaction.vinegar.concentration,
                    'particles': self.reaction.vinegar.particle_count()
                }
            },
            'limiting_reagent': limiting_reagent,
            'reaction_moles': reaction_moles,
            'products': [
                {
                    'name': p.name,
                    'formula': p.formula,
                    'moles': p.moles_produced,
                    'mass_grams': p.moles_produced * MOLAR_MASS.get(p.formula, 0),
                    'state': p.physical_state
                }
                for p in self.reaction.products
            ],
            'gas_volume_liters': self.reaction.calculate_gas_volume(),
            'bubble_count': self.reaction.calculate_bubble_count(),
            'reaction_time_seconds': self.reaction.estimate_reaction_time(),
            'max_foam_ml': self.foam.calculate_max_foam(),
            'heat_released_kj': self.thermo.calculate_heat_released(reaction_moles),
            'enthalpy_change_kj_per_mol': self.thermo.calculate_reaction_enthalpy(),
            'ph_before': pHCalculation.calculate_weak_acid_ph(0.05),
            'ph_after': pHCalculation.calculate_neutral_ph()
        }
        
        return results


# ========== MAIN EXECUTION ==========
if __name__ == '__main__':
    print("=" * 70)
    print("BAKING SODA & VINEGAR ACID-BASE REACTION SIMULATION")
    print("=" * 70)
    print()
    
    # Run simulation with typical values
    sim = ExperimentSimulation(baking_soda_grams=4.2, vinegar_ml=100)
    results = sim.run_simulation()
    
    # Display results
    print("REACTANTS:")
    print(f"  Baking Soda (NaHCO₃):")
    print(f"    - Moles: {results['reactants']['baking_soda']['moles']:.4f} mol")
    print(f"    - Mass: {results['reactants']['baking_soda']['mass_grams']:.2f} g")
    print(f"    - Particles: {results['reactants']['baking_soda']['particles']:.2e}")
    print()
    print(f"  Vinegar (CH₃COOH):")
    print(f"    - Moles: {results['reactants']['vinegar']['moles']:.4f} mol")
    print(f"    - Concentration: {results['reactants']['vinegar']['concentration']:.2f} M")
    print()
    
    print(f"LIMITING REAGENT: {results['limiting_reagent']}")
    print()
    
    print("PRODUCTS:")
    for product in results['products']:
        print(f"  {product['name']} ({product['formula']}):")
        print(f"    - Moles: {product['moles']:.4f} mol")
        print(f"    - Mass: {product['mass_grams']:.2f} g")
        print(f"    - State: {product['state']}")
        print()
    
    print("REACTION DYNAMICS:")
    print(f"  CO₂ Gas Volume: {results['gas_volume_liters']:.2f} L")
    print(f"  Estimated Bubble Count: {results['bubble_count']:,}")
    print(f"  Reaction Time: ~{results['reaction_time_seconds']:.1f} seconds")
    print(f"  Maximum Foam Height: ~{results['max_foam_ml']/100:.1f} cm")
    print()
    
    print("THERMODYNAMICS:")
    print(f"  Heat Released: {results['heat_released_kj']:.2f} kJ")
    print(f"  Enthalpy Change (ΔH): {results['enthalpy_change_kj_per_mol']:.2f} kJ/mol")
    print()
    
    print("pH CHANGES:")
    print(f"  Before Reaction: {results['ph_before']:.2f} (acidic)")
    print(f"  After Reaction: {results['ph_after']:.2f} (neutral)")
    print()
    
    print("=" * 70)
    print("✓ Simulation Complete")
    print("=" * 70)
    
    # Export as JSON for use by web interface
    import json
    with open('simulation_results.json', 'w') as f:
        # Convert numpy types to native Python types
        json_results = json.loads(json.dumps(results, default=str))
        json.dump(json_results, f, indent=2)
    
    print("Results saved to simulation_results.json")
