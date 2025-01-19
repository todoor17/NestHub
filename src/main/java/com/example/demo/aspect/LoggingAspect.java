package com.example.demo.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    // Log before any method in LoginController
    @Before("execution(* com.example.demo.controller.LoginController.login(..))")
    public void logBeforeLogin(JoinPoint joinPoint) {
        System.out.println("Login attempt: " + Arrays.toString(joinPoint.getArgs()));
    }

    // Log after login method executes
    @AfterReturning(value = "execution(* com.example.demo.controller.LoginController.login(..))", returning = "response")
    public void logAfterLogin(JoinPoint joinPoint, Object response) {
        System.out.println("Login completed. Response: " + response);
    }

    // Log before any method in SignUpController
    @Before("execution(* com.example.demo.controller.SignUpController.getValues(..))")
    public void logBeforeSignUp(JoinPoint joinPoint) {
        System.out.println("Sign-up attempt: " + Arrays.toString(joinPoint.getArgs()));
    }

    // Log after the sign-up method executes
    @AfterReturning(value = "execution(* com.example.demo.controller.SignUpController.getValues(..))", returning = "response")
    public void logAfterSignUp(JoinPoint joinPoint, Object response) {
        System.out.println("Sign-up completed. Response: " + response);
    }

    // Generic logging for any controller method
    @Before("execution(* com.example.demo.controller.*.*(..))")
    public void logBeforeAllControllers(JoinPoint joinPoint) {
        System.out.println("Controller method called: " + joinPoint.getSignature());
        System.out.println("Arguments: " + Arrays.toString(joinPoint.getArgs()));
    }
}
