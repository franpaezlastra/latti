package com.Latti.stock;

import com.Latti.stock.modules.*;
import com.Latti.stock.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@SpringBootApplication
public class StockApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(
			ProductoRepository productoRepository,
			InsumoRepository insumoRepository,
			MovimientoProductoLoteRepository movimientoProductoLoteRepository,
			MovimientoInsumoLoteRepository movimientoInsumoLoteRepository,
			RecetaRepository recetaRepository,
			InsumoRecetaRepository insumoRecetaRepository,
			ClientRepository clientRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			
			// Crear cliente de prueba
			if (!clientRepository.existsByUsername("admin")) {
				Client adminClient = new Client();
				adminClient.setUserName("admin");
				adminClient.setPassword(passwordEncoder.encode("admin123"));
				clientRepository.save(adminClient);
				System.out.println("✅ Cliente de prueba creado:");
				System.out.println("   Usuario: admin");
				System.out.println("   Contraseña: admin123");
			}

			// Crear cliente adicional para testing
			if (!clientRepository.existsByUsername("test")) {
				Client testClient = new Client();
				testClient.setUserName("test");
				testClient.setPassword(passwordEncoder.encode("test123"));
				clientRepository.save(testClient);
				System.out.println("✅ Cliente de testing creado:");
				System.out.println("   Usuario: test");
				System.out.println("   Contraseña: test123");
			}

			// Crear cliente para demo
			if (!clientRepository.existsByUsername("demo")) {
				Client demoClient = new Client();
				demoClient.setUserName("demo");
				demoClient.setPassword(passwordEncoder.encode("demo123"));
				clientRepository.save(demoClient);
				System.out.println("✅ Cliente demo creado:");
				System.out.println("   Usuario: demo");
				System.out.println("   Contraseña: demo123");
			}

			System.out.println("\n🎯 Credenciales para probar el sistema:");
			System.out.println("==========================================");
			System.out.println("1. admin / admin123");
			System.out.println("2. test / test123");
			System.out.println("3. demo / demo123");
			System.out.println("==========================================\n");

		};
	}
}
