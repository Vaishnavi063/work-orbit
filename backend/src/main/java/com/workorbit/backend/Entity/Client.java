package com.workorbit.backend.Entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Client {
	
	@Id
	@GeneratedValue
	private Long id;
	
	private String name;
	private String email;
	private String password;
	
	@CreatedDate
	private LocalDateTime createdAt;
	
	@LastModifiedDate
	private LocalDateTime updatedAt;

	public Client() {
		// TODO Auto-generated constructor stub
	}

	public Client(Long id, String name, String email, String password, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.password = password;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	@Override
	public String toString() {
		return "Client [id=" + id + ", name=" + name + ", email=" + email + ", password=" + password + "]";
	}

}
