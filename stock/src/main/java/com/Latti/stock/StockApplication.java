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
			
			

		};
	}
}
